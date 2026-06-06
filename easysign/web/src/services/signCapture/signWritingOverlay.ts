import * as tf from '@tensorflow/tfjs';
import type { LayersModel } from '@tensorflow/tfjs-layers';
import { Box3, Vector2, Vector3 } from 'three';
import { landmarksToVectors, normalizeHand, planeNormal } from './poseNormalization';
import type { Landmark } from './poseNormalization';

const POSE = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
} as const;

const FACE_MAP = {
  Eyes: ['񌞱', '񌡱', '񌠑', '񌧱'],
  Eyebrows: ['񌑑', '񌏱', '񌒱'],
  Mouth: ['񍪱', '񍡱', '񍤱', '񍘱', '񍝑', '񍠑', '񍭱'],
};

type HandPlane = 'wall' | 'floor';
type HandDirection = 'me' | 'you' | 'side';

export interface BodyState {
  shoulders: { center: Vector2; width: number };
  elbows: [Landmark, Landmark];
  wrists: [Landmark, Landmark];
}

export interface HandState {
  bbox: Box3;
  plane: HandPlane;
  rotation: number;
  direction: HandDirection;
  shape: string;
  shapeIndex: number;
  confidence: number;
}

export interface FaceState {
  face?: { location: Vector3; symbol: string };
  eyes?: { left: { location: Vector2; symbol: string }; right: { location: Vector2; symbol: string } };
  eyebrows?: { left: { location: Vector2; symbol: string }; right: { location: Vector2; symbol: string } };
  mouth?: { location: Vector2; symbol: string };
}

export interface SignWritingOverlayState {
  body: BodyState | null;
  leftHand: HandState | null;
  rightHand: HandState | null;
  face: FaceState | null;
}

let handModel: LayersModel | null = null;
let faceModel: LayersModel | null = null;
let fontsReady = false;
let faceFrameCounter = 0;
let cachedFaceState: FaceState | null = null;

function angle(n: number, d: number): number {
  return ((Math.atan2(n, d) * 180) / Math.PI + 360) % 360;
}

function normalizeFace(vectors: Vector3[]): tf.Tensor {
  const normal = planeNormal(vectors, [4, 133, 362]);
  return normalizeHand(vectors, normal, [4, 6], 4, false);
}

export async function loadSignWritingOverlay(): Promise<void> {
  await tf.ready();
  if (!handModel) {
    handModel = await tf.loadLayersModel('/models/hand-shape/model.json');
  }
  if (!faceModel) {
    faceModel = await tf.loadLayersModel('/models/face-features/model.json');
  }
  if (!fontsReady) {
    const fontModule = await import('@sutton-signwriting/font-ttf/font/font.min');
    fontModule.cssAppend('/fonts/');
    await new Promise<void>((resolve) => fontModule.cssLoaded(resolve));
    await document.fonts.load('48px SuttonSignWritingOneD');
    fontsReady = true;
  }
}

function handShape(vectors: Vector3[], isLeft: boolean): { shape: string; shapeIndex: number; confidence: number } {
  const model = handModel;
  if (!model) return { shape: '񆄡', shapeIndex: 0, confidence: 0 };
  const normal = planeNormal(vectors, [0, 5, 17]);
  return tf.tidy(() => {
    const handTensor = normalizeHand(vectors, normal, [0, 9], 0, !isLeft);
    const pred = model.predict(handTensor.reshape([1, 1, 63])) as tf.Tensor;
    const probs = tf.softmax(pred).dataSync();
    let shapeIndex = 0;
    let confidence = 0;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] > confidence) {
        confidence = probs[i];
        shapeIndex = i;
      }
    }
    return {
      shape: String.fromCodePoint(262145 + 0x60 * shapeIndex),
      shapeIndex,
      confidence,
    };
  });
}

export function shapeToIndex(shape: string): number {
  const code = shape.codePointAt(0) ?? 0;
  return Math.round((code - 262145) / 0x60);
}

function handPlane(vectors: Vector3[]): HandPlane {
  const p1 = vectors[0];
  const p2 = vectors[13];
  const y = Math.abs(p2.y - p1.y) * 1.5;
  const z = Math.abs(p2.z - p1.z);
  return y > z ? 'wall' : 'floor';
}

function handRotation(vectors: Vector3[]): number {
  const p1 = vectors[0];
  const p2 = vectors[13];
  const rot = angle(p2.y - p1.y, p2.x - p1.x) + 90;
  const bucket = rot + 360 / 16;
  return Math.floor((bucket % 360) / 45);
}

function handDirection(plane: HandPlane, normal: ReturnType<typeof planeNormal>, flipAxis: boolean): HandDirection {
  const x = flipAxis ? normal.direction.x : -normal.direction.x;
  if (plane === 'wall') {
    const xzAngle = angle(normal.direction.z, x);
    if (xzAngle > 210) return 'me';
    if (xzAngle > 150) return 'side';
    return 'you';
  }
  const xyAngle = angle(normal.direction.y, x);
  if (xyAngle > 0) return 'me';
  if (xyAngle > -60) return 'side';
  return 'you';
}

function buildHand(landmarks: Landmark[], width: number, height: number, isLeft: boolean): HandState {
  const vectors = landmarksToVectors(landmarks, width, height);
  const normal = planeNormal(vectors, [0, 5, 17]);
  normal.direction.multiplyScalar(isLeft ? 1 : -1);
  const plane = handPlane(vectors);
  const { shape, shapeIndex, confidence } = handShape(vectors, isLeft);
  return {
    bbox: new Box3().setFromPoints(vectors),
    plane,
    rotation: handRotation(vectors),
    direction: handDirection(plane, normal, isLeft),
    shape,
    shapeIndex,
    confidence,
  };
}

function buildFace(landmarks: Landmark[], width: number, height: number): FaceState {
  const vectors = landmarks.map((l) => new Vector3(l.x * width, l.y * height, l.z * width));
  const faceLocation = vectors[4];

  faceFrameCounter += 1;
  if (cachedFaceState && faceFrameCounter % 4 !== 0) {
    return {
      ...cachedFaceState,
      face: cachedFaceState.face
        ? { ...cachedFaceState.face, location: faceLocation }
        : { location: faceLocation, symbol: '񋾡' },
    };
  }

  if (!faceModel) {
    return { face: { location: faceLocation, symbol: '񌞁' } };
  }

  const state = tf.tidy(() => {
    const faceTensor = normalizeFace(vectors);
    let pred = faceModel!.predict(faceTensor.reshape([1, 1, 468 * 3])) as tf.Tensor;
    pred = pred.reshape([-1]);
    const result: Record<string, string> = {};
    let i = 0;
    for (const [k, vs] of Object.entries(FACE_MAP)) {
      result[k] = vs[pred.slice(i, i + vs.length).argMax(0).dataSync()[0]];
      i += vs.length;
    }
    return result;
  });

  const shift = (char: string, s: number) => String.fromCodePoint((char.codePointAt(0) ?? 0) + s);
  const eyesY = (vectors[133].y + vectors[362].y) / 2;

  cachedFaceState = {
    face: { location: faceLocation, symbol: '񋾡' },
    eyes: {
      left: { location: new Vector2((vectors[133].x + vectors[33].x) / 2, eyesY), symbol: shift(state.Eyes, 0x10) },
      right: { location: new Vector2((vectors[362].x + vectors[263].x) / 2, eyesY), symbol: shift(state.Eyes, 0x10) },
    },
    eyebrows: {
      left: { location: new Vector2(vectors[282].x, (vectors[65].y + vectors[362].y) / 2), symbol: shift(state.Eyebrows, 0x10) },
      right: { location: new Vector2(vectors[52].x, (vectors[65].y + vectors[362].y) / 2), symbol: shift(state.Eyebrows, 0x20) },
    },
    mouth: {
      location: new Vector2((vectors[14].x + vectors[17].x) / 2, (vectors[14].y + vectors[17].y) / 2),
      symbol: state.Mouth,
    },
  };
  return cachedFaceState;
}

function buildBody(pose: Landmark[]): BodyState | null {
  if (pose.length <= POSE.RIGHT_WRIST) return null;
  const p1 = pose[POSE.LEFT_SHOULDER];
  const p2 = pose[POSE.RIGHT_SHOULDER];
  if (!p1 || !p2) return null;
  const width = Math.abs(p1.x - p2.x);
  if (width < 0.02) return null;
  return {
    shoulders: {
      center: new Vector2((p1.x + p2.x) / 2, (p1.y + p2.y) / 2),
      width,
    },
    elbows: [pose[POSE.LEFT_ELBOW], pose[POSE.RIGHT_ELBOW]],
    wrists: [pose[POSE.LEFT_WRIST], pose[POSE.RIGHT_WRIST]],
  };
}

function fallbackShoulderWidth(state: SignWritingOverlayState, canvasWidth: number): number {
  if (state.body?.shoulders.width) return state.body.shoulders.width;
  const hand = state.leftHand ?? state.rightHand;
  if (!hand || canvasWidth <= 0) return 0.25;
  const handNormWidth = (hand.bbox.max.x - hand.bbox.min.x) / canvasWidth;
  return Math.max(0.15, Math.min(0.5, handNormWidth * 3));
}

export function buildOverlayState(frame: {
  width: number;
  height: number;
  poseLandmarks: Landmark[] | null;
  faceLandmarks: Landmark[] | null;
  leftHandLandmarks: Landmark[] | null;
  rightHandLandmarks: Landmark[] | null;
}): SignWritingOverlayState {
  const { width, height, poseLandmarks, faceLandmarks, leftHandLandmarks, rightHandLandmarks } = frame;
  const state: SignWritingOverlayState = {
    body: null,
    leftHand: null,
    rightHand: null,
    face: null,
  };

  if (poseLandmarks) {
    try {
      state.body = buildBody(poseLandmarks);
    } catch (err) {
      console.warn('Body overlay failed:', err);
    }
  }

  if (leftHandLandmarks?.length) {
    try {
      state.leftHand = buildHand(leftHandLandmarks, width, height, true);
    } catch (err) {
      console.warn('Left hand overlay failed:', err);
    }
  }

  if (rightHandLandmarks?.length) {
    try {
      state.rightHand = buildHand(rightHandLandmarks, width, height, false);
    } catch (err) {
      console.warn('Right hand overlay failed:', err);
    }
  }

  if (faceLandmarks?.length) {
    try {
      state.face = buildFace(faceLandmarks, width, height);
    } catch (err) {
      console.warn('Face overlay failed:', err);
    }
  }

  return state;
}

function textFontSize(text: string, width: number, ctx: CanvasRenderingContext2D): number {
  ctx.font = '100px SuttonSignWritingOneD';
  const measure = ctx.measureText(text);
  const bboxWidth = width * ctx.canvas.width;
  return (100 * bboxWidth) / measure.width;
}

function drawSWText(
  text: string,
  center: Vector2 | Vector3,
  fontSize: number,
  ctx: CanvasRenderingContext2D,
  isNormalized = true,
): void {
  ctx.font = `${fontSize}px SuttonSignWritingOneD`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0f172a';
  const x = isNormalized ? center.x * ctx.canvas.width : center.x;
  const y = isNormalized ? center.y * ctx.canvas.height : center.y;
  ctx.fillText(text, x, y);
}

function drawHandGlyph(
  shouldersWidth: number,
  hand: HandState,
  isLeft: boolean,
  ctx: CanvasRenderingContext2D,
): void {
  let char = hand.shape.codePointAt(0) ?? 0;
  const heelView = new Set(['񁹱', '񁳱', '񆆑', '񅱑', '񁶱', '񂍑', '񂊑'].map((c) => c.codePointAt(0)!));
  const isHeelView = heelView.has(char + 0x10);

  if (!isLeft) char += 0x8;
  char += isLeft ? (8 - hand.rotation) % 8 : hand.rotation;

  if (isHeelView) {
    char += 0x10;
  } else {
    if (hand.plane === 'floor') char += 0x30;
    const shifts = { you: 0, side: 0x10, me: 0x20 };
    char += shifts[hand.direction];
  }

  const text = String.fromCodePoint(char);
  const center = new Vector2(
    (hand.bbox.min.x + hand.bbox.max.x) / (2 * ctx.canvas.width),
    (hand.bbox.min.y + hand.bbox.max.y) / (2 * ctx.canvas.height),
  );
  const fontSize = textFontSize('񂇁', shouldersWidth / 3, ctx);
  drawSWText(text, center, fontSize, ctx);
}

function drawBody(body: BodyState, ctx: CanvasRenderingContext2D): void {
  const shouldersText = '񎣡';
  const fontSize = textFontSize(shouldersText, body.shoulders.width, ctx);
  drawSWText(shouldersText, body.shoulders.center, fontSize, ctx);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = (body.shoulders.width * ctx.canvas.width) / 50;
  const shoulders = [
    { x: body.shoulders.center.x + 0.45 * body.shoulders.width, y: body.shoulders.center.y },
    { x: body.shoulders.center.x - 0.45 * body.shoulders.width, y: body.shoulders.center.y },
  ] as Landmark[];

  const drawArm = (shoulder: Landmark, elbow: Landmark, wrist: Landmark) => {
    if ((elbow.visibility ?? 1) < 0.8) return;
    ctx.beginPath();
    ctx.moveTo(shoulder.x * ctx.canvas.width, shoulder.y * ctx.canvas.height);
    ctx.lineTo(elbow.x * ctx.canvas.width, elbow.y * ctx.canvas.height);
    if ((wrist.visibility ?? 1) > 0.8) {
      ctx.lineTo(wrist.x * ctx.canvas.width, wrist.y * ctx.canvas.height);
    }
    ctx.stroke();
  };

  drawArm(shoulders[0], body.elbows[0], body.wrists[0]);
  drawArm(shoulders[1], body.elbows[1], body.wrists[1]);
}

function drawFace(state: SignWritingOverlayState, ctx: CanvasRenderingContext2D): void {
  if (!state.face) return;
  const sw = fallbackShoulderWidth(state, ctx.canvas.width);
  const { face, eyes, eyebrows, mouth } = state.face;
  const drawFeature = (width: number, loc: Vector2 | Vector3, symbol: string) => {
    drawSWText(symbol, loc, textFontSize(symbol, width, ctx), ctx, false);
  };
  if (face) drawFeature(sw * 0.7, face.location, face.symbol);
  if (eyes) {
    drawFeature(sw * 0.2, eyes.left.location, eyes.left.symbol);
    drawFeature(sw * 0.2, eyes.right.location, eyes.right.symbol);
  }
  if (eyebrows) {
    drawFeature(sw * 0.15, eyebrows.left.location, eyebrows.left.symbol);
    drawFeature(sw * 0.15, eyebrows.right.location, eyebrows.right.symbol);
  }
  if (mouth) drawFeature(sw * 0.25, mouth.location, mouth.symbol);
}

export function drawSignWritingOverlay(state: SignWritingOverlayState, ctx: CanvasRenderingContext2D): void {
  const sw = fallbackShoulderWidth(state, ctx.canvas.width);
  if (state.body) drawBody(state.body, ctx);
  if (state.face) drawFace(state, ctx);
  if (state.leftHand) drawHandGlyph(sw, state.leftHand, true, ctx);
  if (state.rightHand) drawHandGlyph(sw, state.rightHand, false, ctx);
}

export function dominantHandDetection(
  state: SignWritingOverlayState,
): { index: number; confidence: number; isLeft: boolean } | null {
  const pick = (hand: HandState | null, isLeft: boolean) =>
    hand
      ? { index: hand.shapeIndex, confidence: hand.confidence, isLeft, size: hand.bbox.getSize(new Vector3()).length() }
      : null;
  const left = pick(state.leftHand, true);
  const right = pick(state.rightHand, false);
  if (!left && !right) return null;
  if (!left) return { index: right!.index, confidence: right!.confidence, isLeft: false };
  if (!right) return { index: left.index, confidence: left.confidence, isLeft: true };
  return left.size >= right.size
    ? { index: left.index, confidence: left.confidence, isLeft: true }
    : { index: right.index, confidence: right.confidence, isLeft: false };
}
