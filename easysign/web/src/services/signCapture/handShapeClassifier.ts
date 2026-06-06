import * as tf from '@tensorflow/tfjs';
import type { LayersModel } from '@tensorflow/tfjs-layers';
import { landmarksToVectors, normalizeHand, planeNormal } from './poseNormalization';
import type { Landmark } from './poseNormalization';

let modelPromise: Promise<LayersModel> | null = null;

export async function loadHandShapeModel(): Promise<LayersModel> {
  if (!modelPromise) {
    await tf.ready();
    modelPromise = tf.loadLayersModel('/models/hand-shape/model.json');
  }
  return modelPromise;
}

export function shapeIndexToGlyph(index: number): string {
  return String.fromCodePoint(262145 + 0x60 * index);
}

export function classifyHandShape(
  model: LayersModel,
  landmarks: Landmark[],
  width: number,
  height: number,
  isLeft: boolean,
): { index: number; confidence: number } {
  const vectors = landmarksToVectors(landmarks, width, height);
  const normal = planeNormal(vectors, [0, 5, 17]);

  const result = tf.tidy(() => {
    const handTensor = normalizeHand(vectors, normal, [0, 9], 0, !isLeft);
    const pred = model.predict(handTensor.reshape([1, 1, 63])) as tf.Tensor;
    const probs = tf.softmax(pred).dataSync();
    let bestIndex = 0;
    let bestScore = 0;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] > bestScore) {
        bestScore = probs[i];
        bestIndex = i;
      }
    }
    return { index: bestIndex, confidence: bestScore };
  });

  return result;
}

export function pickDominantHand(
  hands: Landmark[][],
  handedness: { label: string }[][],
): { landmarks: Landmark[]; isLeft: boolean } | null {
  if (hands.length === 0) return null;

  let bestIdx = 0;
  let bestSize = 0;
  for (let i = 0; i < hands.length; i++) {
    const xs = hands[i].map((l) => l.x);
    const ys = hands[i].map((l) => l.y);
    const size = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    if (size > bestSize) {
      bestSize = size;
      bestIdx = i;
    }
  }

  const label = handedness[bestIdx]?.[0]?.label ?? 'Right';
  return { landmarks: hands[bestIdx], isLeft: label === 'Left' };
}
