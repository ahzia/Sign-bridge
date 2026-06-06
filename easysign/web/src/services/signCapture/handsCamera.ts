import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import type { Landmark } from './poseNormalization';

const TASKS_VERSION = '0.10.21';
const WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number,
): void {
  ctx.fillStyle = '#00ff88';
  for (const l of landmarks) {
    ctx.beginPath();
    ctx.arc(l.x * width, l.y * height, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export type HandsFrameCallback = (result: {
  landmarks: Landmark[] | null;
  isLeft: boolean;
  width: number;
  height: number;
  gesture: string | null;
  gestureScore: number;
}) => void;

export class HandsCamera {
  private recognizer: GestureRecognizer | null = null;
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private rafId = 0;

  async start(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onFrame: HandsFrameCallback,
  ): Promise<void> {
    this.video = video;

    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    this.recognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_PATH },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });

    video.srcObject = this.stream;
    video.playsInline = true;
    video.muted = true;
    await video.play();

    let lastVideoTime = -1;

    const loop = () => {
      const v = this.video;
      const c = canvas;
      const recognizer = this.recognizer;

      if (v && c && recognizer && v.readyState >= 2 && v.videoWidth > 0) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;

        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(v, 0, 0, c.width, c.height);

          if (v.currentTime !== lastVideoTime) {
            lastVideoTime = v.currentTime;
            const result = recognizer.recognizeForVideo(v, performance.now());

            let landmarks: Landmark[] | null = null;
            let isLeft = false;
            let gesture: string | null = null;
            let gestureScore = 0;

            if (result.landmarks.length > 0) {
              let bestIdx = 0;
              let bestSize = 0;
              for (let i = 0; i < result.landmarks.length; i++) {
                const hand = result.landmarks[i];
                const xs = hand.map((l) => l.x);
                const ys = hand.map((l) => l.y);
                const size =
                  (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
                if (size > bestSize) {
                  bestSize = size;
                  bestIdx = i;
                }
              }

              landmarks = result.landmarks[bestIdx] as Landmark[];
              isLeft = result.handedness[bestIdx]?.[0]?.categoryName === 'Left';

              const topGesture = result.gestures[bestIdx]?.[0];
              gesture = topGesture?.categoryName ?? null;
              gestureScore = topGesture?.score ?? 0;

              for (const hand of result.landmarks) {
                drawHandLandmarks(ctx, hand as Landmark[], c.width, c.height);
              }
            }

            onFrame({
              landmarks,
              isLeft,
              width: c.width,
              height: c.height,
              gesture,
              gestureScore,
            });
          }
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    loop();
  }

  stop(): void {
    cancelAnimationFrame(this.rafId);
    this.recognizer?.close();
    this.recognizer = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
  }
}
