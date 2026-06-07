import { useEffect, useRef, useState } from 'react';
import { HandsCamera } from '../../services/signCapture/handsCamera';
import {
  HOSPITAL_GESTURE_PACK,
  lookupHospitalGesture,
  TRIAGE_STYLES,
  type HospitalGesture,
  type TriagePriority,
} from '../../data/hospitalGestures';

export interface PatientGestureEvent {
  gesture: HospitalGesture | null;
  rawGesture: string | null;
  score: number;
  stability: number;
}

interface PatientGesturePanelProps {
  onGesture: (event: PatientGestureEvent) => void;
  compact?: boolean;
  /** Hide labels below camera — use when a separate overlay shows the gesture */
  cameraOnly?: boolean;
}

const STABLE_WINDOW = 16;
const STABLE_THRESHOLD = 10;

const PatientGesturePanel = ({ onGesture, compact = false, cameraOnly = false }: PatientGesturePanelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<HandsCamera | null>(null);
  const bufferRef = useRef<string[]>([]);
  const lastEmitRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<HospitalGesture | null>(null);
  const [rawGesture, setRawGesture] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [stability, setStability] = useState(0);

  useEffect(() => {
    let active = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const camera = new HandsCamera();
    cameraRef.current = camera;

    camera
      .start(video, canvas, ({ gesture, gestureScore }) => {
        const now = performance.now();
        if (gesture && gesture !== 'None' && gestureScore >= 0.4) {
          bufferRef.current.push(gesture);
          if (bufferRef.current.length > STABLE_WINDOW) bufferRef.current.shift();
        } else {
          bufferRef.current = [];
        }

        const counts = new Map<string, number>();
        for (const g of bufferRef.current) counts.set(g, (counts.get(g) ?? 0) + 1);
        let mode = gesture ?? 'None';
        let modeCount = 0;
        for (const [g, c] of counts) {
          if (c > modeCount) {
            mode = g;
            modeCount = c;
          }
        }

        const stab = bufferRef.current.length ? modeCount / STABLE_WINDOW : 0;
        const matched = lookupHospitalGesture(mode, gestureScore);

        if (now - lastEmitRef.current >= 120) {
          lastEmitRef.current = now;
          setRawGesture(gesture);
          setScore(gestureScore);
          setStability(stab);
          setCurrent(matched);

          if (stab >= STABLE_THRESHOLD / STABLE_WINDOW) {
            onGesture({ gesture: matched, rawGesture: mode, score: gestureScore, stability: stab });
          } else if (!gesture || gesture === 'None') {
            onGesture({ gesture: null, rawGesture: null, score: 0, stability: 0 });
          }
        }
      })
      .then(() => {
        if (active) setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Camera failed');
        setLoading(false);
      });

    return () => {
      active = false;
      cameraRef.current?.stop();
      cameraRef.current = null;
    };
  }, [onGesture]);

  const priority: TriagePriority | null = current?.priority ?? null;

  return (
    <div className={`flex flex-col h-full ${cameraOnly ? '' : 'gap-3'}`}>
      <div className={`relative overflow-hidden bg-black ${cameraOnly ? 'h-full' : 'rounded-xl aspect-video'}`}>
        <video ref={videoRef} className="hidden" playsInline autoPlay muted />
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-8 h-8 loading-spinner" />
          </div>
        )}
        {!cameraOnly && priority && (priority === 'critical' || priority === 'high') && (
          <div
            className={`absolute top-0 left-0 right-0 px-3 py-1.5 text-xs font-bold text-center ${TRIAGE_STYLES[priority].banner}`}
          >
            {TRIAGE_STYLES[priority].label}: {current?.label}
          </div>
        )}
        {cameraOnly && !loading && !current && (
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-[10px] text-white/70 bg-black/50 rounded-full px-3 py-1 inline-block">
              {rawGesture && rawGesture !== 'None'
                ? `Hold ${rawGesture.replace(/_/g, ' ')} steady…`
                : 'Show your hand to the camera'}
            </p>
          </div>
        )}
      </div>

      {error && !cameraOnly && <p className="text-xs text-danger-600">{error}</p>}

      {!cameraOnly && (current ? (
        <div className={`rounded-lg border px-3 py-2 ${TRIAGE_STYLES[current.priority].badge}`}>
          <p className="font-semibold text-sm">{current.label}</p>
          <p className="text-xs mt-0.5 opacity-90">{current.staffMessage}</p>
          <p className="text-[10px] mt-1 opacity-75">
            {Math.round(score * 100)}% · stability {Math.round(stability * 100)}%
          </p>
        </div>
      ) : (
        <p className="text-xs text-theme-muted">
          {rawGesture && rawGesture !== 'None'
            ? `Detecting ${rawGesture.replace(/_/g, ' ')}… hold steady`
            : 'Patient: show a hand gesture to the camera'}
        </p>
      ))}

      {!compact && !cameraOnly && (
        <div className="text-[10px] text-theme-muted">
          <p className="font-semibold mb-1">Hospital gesture pack</p>
          <ul className="space-y-0.5">
            {HOSPITAL_GESTURE_PACK.filter((g) => g.priority === 'critical' || g.priority === 'high').map(
              (g) => (
                <li key={g.mediapipeGesture}>
                  {g.label} — {g.hint}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PatientGesturePanel;
