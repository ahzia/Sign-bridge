import { useCallback, useEffect, useRef, useState } from 'react';
import SignWritingPanel from '../SignWritingPanel';
import { HandsCamera } from '../../services/signCapture/handsCamera';
import {
  GESTURE_MAP,
  lookupGesture,
  SUPPORTED_GESTURES,
} from '../../services/signCapture/gestureDictionary';

interface SignCaptureDemoProps {
  onBack: () => void;
}

const STABLE_WINDOW = 20;
const STABLE_THRESHOLD = 14;

const SignCaptureDemo = ({ onBack }: SignCaptureDemoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<HandsCamera | null>(null);
  const gestureBufferRef = useRef<string[]>([]);
  const lastUiUpdateRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Starting camera…');
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [stability, setStability] = useState(0);
  const [english, setEnglish] = useState('');
  const [fswTokens, setFswTokens] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  const processDetection = useCallback((gesture: string | null, score: number) => {
    const now = performance.now();
    const shouldUpdateUi = now - lastUiUpdateRef.current >= 100;

    if (!gesture || gesture === 'None' || score < 0.5) {
      gestureBufferRef.current = [];
      if (shouldUpdateUi) {
        lastUiUpdateRef.current = now;
        setDetectedGesture(gesture);
        setConfidence(score);
        setStability(0);
        setLocked(false);
        setEnglish('');
        setFswTokens([]);
        setStatus('Show a gesture to the camera');
      }
      return;
    }

    const buf = gestureBufferRef.current;
    buf.push(gesture);
    if (buf.length > STABLE_WINDOW) buf.shift();

    const counts = new Map<string, number>();
    for (const g of buf) counts.set(g, (counts.get(g) ?? 0) + 1);
    let mode = gesture;
    let modeCount = 0;
    for (const [g, c] of counts) {
      if (c > modeCount) {
        mode = g;
        modeCount = c;
      }
    }

    if (!shouldUpdateUi) return;
    lastUiUpdateRef.current = now;

    setDetectedGesture(gesture);
    setConfidence(score);
    setStability(modeCount / STABLE_WINDOW);

    if (modeCount >= STABLE_THRESHOLD) {
      const match = lookupGesture(mode, score);
      setLocked(true);
      setEnglish(match?.english ?? mode.replace(/_/g, ' '));
      setFswTokens(match?.fsw ? [match.fsw] : []);
      setStatus(match ? 'Gesture recognized' : `Detected: ${mode.replace(/_/g, ' ')}`);
    } else {
      setLocked(false);
      setStatus(`Hold "${gesture.replace(/_/g, ' ')}" steady…`);
      setEnglish('');
      setFswTokens([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      try {
        const camera = new HandsCamera();
        cameraRef.current = camera;

        await camera.start(video, canvas, ({ gesture, gestureScore }) => {
          processDetection(gesture, gestureScore);
        });

        if (active) {
          setLoading(false);
          setStatus('Show a gesture to the camera');
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to start camera demo');
        setLoading(false);
      }
    };

    init();

    return () => {
      active = false;
      cameraRef.current?.stop();
      cameraRef.current = null;
    };
  }, [processDetection]);

  const resetCapture = () => {
    gestureBufferRef.current = [];
    setLocked(false);
    setEnglish('');
    setFswTokens([]);
    setDetectedGesture(null);
    setStability(0);
    setStatus('Show a gesture to the camera');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b border-theme-primary sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-theme-primary">Sign Capture Demo</h1>
            <p className="text-xs text-theme-secondary">
              Camera gestures → English + SignWriting (MediaPipe built-in recognizer)
            </p>
          </div>
          <button onClick={onBack} className="btn btn-secondary text-sm">
            ← Back to Translate
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-800">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4 flex flex-col">
            <h2 className="text-lg font-bold text-theme-primary mb-2">Camera</h2>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video ref={videoRef} className="hidden" playsInline autoPlay muted />
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="w-10 h-10 loading-spinner" />
                </div>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-sm text-theme-secondary">{status}</p>
              {detectedGesture && detectedGesture !== 'None' && (
                <p className="text-xs text-theme-muted">
                  {detectedGesture.replace(/_/g, ' ')} · {Math.round(confidence * 100)}% · stability{' '}
                  {Math.round(stability * 100)}%
                  {locked && ' · locked'}
                </p>
              )}
              <div className="h-2 bg-theme-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-200"
                  style={{ width: `${Math.min(100, stability * 100)}%` }}
                />
              </div>
              <button onClick={resetCapture} className="btn btn-secondary text-sm w-full mt-2">
                Try another sign
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="card p-4">
              <h2 className="text-lg font-bold text-theme-primary mb-2">English</h2>
              {english ? (
                <p className="text-2xl font-semibold text-theme-primary">{english}</p>
              ) : (
                <p className="text-sm text-theme-muted">Hold a gesture steady to see a label</p>
              )}
            </div>

            <div className="card p-4 flex-1 min-h-[200px]">
              <h2 className="text-lg font-bold text-theme-primary mb-2">SignWriting</h2>
              <div className="min-h-[120px]">
                {fswTokens.length > 0 ? (
                  <SignWritingPanel fswTokens={fswTokens} signSize={40} />
                ) : (
                  <p className="text-sm text-theme-muted">SignWriting appears for some matched gestures</p>
                )}
              </div>
            </div>

            <div className="card p-4">
              <h2 className="text-sm font-bold text-theme-primary mb-2">Try these gestures</h2>
              <ul className="text-xs text-theme-secondary space-y-1.5">
                {SUPPORTED_GESTURES.map((key) => (
                  <li key={key}>
                    <span className="font-medium text-theme-primary">{key.replace(/_/g, ' ')}</span>
                    {' — '}
                    {GESTURE_MAP[key].hint}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-theme-muted mt-3">
                Uses Google MediaPipe Gesture Recognizer (free, runs in browser). For full ASL sentences,
                a custom trained model or paid API would be needed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignCaptureDemo;
