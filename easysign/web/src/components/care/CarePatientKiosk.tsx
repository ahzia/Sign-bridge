import { useCallback, useState } from 'react';
import PatientSignOutput from './PatientSignOutput';
import PatientGesturePanel, { type PatientGestureEvent } from './PatientGesturePanel';
import VisitRoomBar from './VisitRoomBar';
import { useVisitRoom } from '../../hooks/useVisitRoom';
import { speakText } from '../../services/runSignPipeline';
import { base64ToBlob, getRoomFromUrl, type VisitMessage } from '../../services/visitSync';

const CarePatientKiosk = () => {
  const roomId = getRoomFromUrl();
  const [english, setEnglish] = useState('');
  const [cantonese, setCantonese] = useState('');
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [poseFile, setPoseFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const onVisitMessage = useCallback((message: VisitMessage) => {
    if (message.type === 'phrase_loading') {
      setEnglish(message.english);
      setCantonese(message.cantonese);
      setSignWriting([]);
      setPoseFile(null);
      setLoading(true);
      return;
    }

    if (message.type === 'phrase_output') {
      setEnglish(message.english);
      setCantonese(message.cantonese);
      setSignWriting(message.signWriting);
      setPoseFile(message.poseBase64 ? base64ToBlob(message.poseBase64) : null);
      setLoading(false);
      speakText(message.english);
    }
  }, []);

  const { publish, staffOnline } = useVisitRoom(roomId, 'patient', onVisitMessage);

  const handlePatientGesture = useCallback(
    (event: PatientGestureEvent) => {
      if (!roomId) return;

      if (event.gesture && event.stability >= 0.5) {
        publish({
          type: 'patient_gesture',
          gesture: event.gesture,
          rawGesture: event.rawGesture,
          stability: event.stability,
        });
      } else if (!event.rawGesture || event.rawGesture === 'None') {
        publish({
          type: 'patient_gesture',
          gesture: null,
          rawGesture: null,
          stability: 0,
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-teal-950 text-white">
      <header className="border-b border-teal-800/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-teal-300/80">EasySign Care</p>
            <h1 className="text-lg font-bold">Patient screen</h1>
          </div>
          <p className="text-xs text-teal-200/70 hidden sm:block">Signs appear here when staff selects a phrase</p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        <VisitRoomBar roomId={roomId} staffOnline={staffOnline} role="patient" />

        <div className="flex-1 card p-4 sm:p-6 bg-white/95 dark:bg-slate-900/90 text-theme-primary min-h-[320px]">
          <PatientSignOutput
            english={english}
            cantonese={cantonese}
            signWriting={signWriting}
            poseFile={poseFile}
            loading={loading}
            variant="kiosk"
            emptyMessage="Waiting for staff to select a phrase…"
          />
        </div>

        <div className="card p-3 bg-black/40 border-teal-800/50">
          <p className="text-xs text-teal-200 mb-2 font-medium">
            Show a gesture if you need help (closed fist = emergency)
          </p>
          <div className="max-h-[220px]">
            <PatientGesturePanel onGesture={handlePatientGesture} compact />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CarePatientKiosk;
