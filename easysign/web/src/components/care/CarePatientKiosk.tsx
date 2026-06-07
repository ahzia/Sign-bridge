import { useCallback, useEffect, useRef, useState } from 'react';
import { GESTURE_ALERT_DURATION_MS } from './careConstants';
import PatientSignOutput from './PatientSignOutput';
import PatientGesturePanel, { type PatientGestureEvent } from './PatientGesturePanel';
import GestureAlertOverlay from './GestureAlertOverlay';
import VisitRoomBar from './VisitRoomBar';
import type { HospitalGesture } from '../../data/hospitalGestures';
import { useVisitRoom } from '../../hooks/useVisitRoom';
import { base64ToBlob, getRoomFromUrl, type VisitMessage } from '../../services/visitSync';

const cancelSpeech = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

const CarePatientKiosk = () => {
  const roomId = getRoomFromUrl();

  useEffect(() => {
    cancelSpeech();
    return cancelSpeech;
  }, []);
  const [english, setEnglish] = useState('');
  const [cantonese, setCantonese] = useState('');
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [poseFile, setPoseFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeGesture, setActiveGesture] = useState<HospitalGesture | null>(null);
  const gestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearGestureTimer = () => {
    if (gestureTimerRef.current) {
      clearTimeout(gestureTimerRef.current);
      gestureTimerRef.current = null;
    }
  };

  useEffect(() => () => clearGestureTimer(), []);

  const onVisitMessage = useCallback((message: VisitMessage) => {
    if (message.type === 'phrase_loading') {
      cancelSpeech();
      setEnglish(message.english);
      setCantonese(message.cantonese);
      setSignWriting([]);
      setPoseFile(null);
      setLoading(true);
      return;
    }

    if (message.type === 'phrase_output') {
      cancelSpeech();
      setEnglish(message.english);
      setCantonese(message.cantonese);
      setSignWriting(message.signWriting);
      setPoseFile(message.poseBase64 ? base64ToBlob(message.poseBase64) : null);
      setLoading(false);
    }

    if (message.type === 'triage_dismiss') {
      clearGestureTimer();
      setActiveGesture(null);
    }
  }, []);

  const { publish, staffOnline } = useVisitRoom(roomId, 'patient', onVisitMessage);

  const handlePatientGesture = useCallback(
    (event: PatientGestureEvent) => {
      if (!roomId) return;

      if (event.gesture && event.stability >= 0.5) {
        setActiveGesture(event.gesture);
        clearGestureTimer();
        gestureTimerRef.current = setTimeout(() => setActiveGesture(null), GESTURE_ALERT_DURATION_MS);
        publish({
          type: 'patient_gesture',
          gesture: event.gesture,
          rawGesture: event.rawGesture,
          stability: event.stability,
        });
      }
    },
    [publish, roomId],
  );

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-950 text-white p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Patient screen</h1>
          <p className="text-teal-200 text-sm">
            Open this page from the staff console using &ldquo;Open patient screen&rdquo; or a visit room link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-teal-950 text-white relative">
      {activeGesture && (
        <GestureAlertOverlay gesture={activeGesture} audience="patient" />
      )}

      <header className="border-b border-teal-800/50 px-4 py-3 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-300/80">EasySign Care</p>
            <h1 className="text-lg font-bold">Patient screen</h1>
          </div>
          <p className="text-xs text-teal-200/70 hidden sm:block">
            Signs from staff · gestures to alert staff
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4 flex flex-col gap-4 min-h-0">
        <VisitRoomBar roomId={roomId} staffOnline={staffOnline} role="patient" />

        <div className="flex-1 card p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 text-theme-primary min-h-[280px]">
          <PatientSignOutput
            english={english}
            cantonese={cantonese}
            signWriting={signWriting}
            poseFile={poseFile}
            loading={loading}
            variant="kiosk"
            emptyMessage="Waiting for staff to speak or select a phrase…"
          />
        </div>

        <div className="shrink-0 rounded-xl border border-teal-700/50 bg-black/50 overflow-hidden">
          <div className="px-4 py-2 border-b border-teal-800/50 flex items-center justify-between gap-2">
            <p className="text-xs text-teal-200 font-medium">
              Your camera — show a gesture to alert staff
            </p>
            <p className="text-[10px] text-teal-300/60 hidden sm:block">
              Closed fist = emergency · Thumb down = no / worse
            </p>
          </div>
          <div className="h-[160px] sm:h-[200px]">
            <PatientGesturePanel onGesture={handlePatientGesture} compact cameraOnly />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarePatientKiosk;
