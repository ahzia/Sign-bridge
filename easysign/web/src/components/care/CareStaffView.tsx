import { useCallback, useEffect, useState } from 'react';
import PhraseBoard from './PhraseBoard';
import VisitRoomBar from './VisitRoomBar';
import type { ClinicalPhrase } from '../../data/clinicalPhrases';
import type { HospitalGesture } from '../../data/hospitalGestures';
import { TRIAGE_STYLES } from '../../data/hospitalGestures';
import { useNavigate } from '../../hooks/usePathname';
import { useVisitRoom } from '../../hooks/useVisitRoom';
import { runEnglishSignPipeline, speakText } from '../../services/runSignPipeline';
import {
  blobToBase64,
  generateRoomId,
  getRoomFromUrl,
  type VisitMessage,
} from '../../services/visitSync';

interface VisitLogEntry {
  id: string;
  time: string;
  side: 'staff' | 'patient';
  text: string;
  priority?: string;
}

const CareStaffView = () => {
  const navigate = useNavigate();
  const [roomId] = useState(() => getRoomFromUrl() ?? generateRoomId());
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageAlert, setTriageAlert] = useState<HospitalGesture | null>(null);
  const [visitLog, setVisitLog] = useState<VisitLogEntry[]>([]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    window.history.replaceState({}, '', url.pathname + url.search);
  }, [roomId]);

  const addLog = (side: 'staff' | 'patient', text: string, priority?: string) => {
    setVisitLog((prev) => [
      {
        id: `${Date.now()}-${prev.length}`,
        time: new Date().toLocaleTimeString(),
        side,
        text,
        priority,
      },
      ...prev.slice(0, 19),
    ]);
  };

  const onVisitMessage = useCallback((message: VisitMessage) => {
    if (message.type === 'patient_gesture') {
      if (message.gesture && message.stability >= 0.5) {
        setTriageAlert(message.gesture as HospitalGesture);
        addLog('patient', message.gesture.label, message.gesture.priority);
      } else if (!message.rawGesture) {
        setTriageAlert(null);
      }
    }
  }, []);

  const { publish, patientOnline } = useVisitRoom(roomId, 'staff', onVisitMessage);

  const handlePhraseSelect = async (phrase: ClinicalPhrase) => {
    setActivePhraseId(phrase.id);
    setError(null);
    setLoading(true);
    speakText(phrase.english);

    publish({
      type: 'phrase_loading',
      phraseId: phrase.id,
      english: phrase.english,
      cantonese: phrase.cantonese,
    });

    try {
      const result = await runEnglishSignPipeline(phrase.english);
      const poseBase64 = result.poseFile ? await blobToBase64(result.poseFile) : null;

      publish({
        type: 'phrase_output',
        phraseId: phrase.id,
        english: phrase.english,
        cantonese: phrase.cantonese,
        signWriting: result.signWriting,
        poseBase64,
      });

      addLog('staff', phrase.english);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate signs');
    } finally {
      setLoading(false);
    }
  };

  const dismissTriage = () => {
    setTriageAlert(null);
    publish({ type: 'triage_dismiss' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/20">
      <header className="glass border-b border-teal-200 dark:border-teal-900 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-teal-700 dark:text-teal-300 truncate">
                  Staff console
                </h1>
                <p className="text-xs text-theme-secondary hidden sm:block">
                  Phrase board · visit log · triage alerts
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/care')} className="btn btn-secondary text-sm shrink-0">
              ← Care hub
            </button>
          </div>
        </div>
      </header>

      {triageAlert && (
        <div className={`${TRIAGE_STYLES[triageAlert.priority].banner} px-4 py-3`}>
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-sm">
                {TRIAGE_STYLES[triageAlert.priority].label} priority — {triageAlert.label}
              </p>
              <p className="text-sm opacity-95 mt-0.5">{triageAlert.staffMessage}</p>
            </div>
            <button onClick={dismissTriage} className="text-white/90 hover:text-white text-xs underline shrink-0">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        <VisitRoomBar roomId={roomId} patientOnline={patientOnline} role="staff" />

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-800">{error}</div>
        )}

        {loading && (
          <div className="text-xs text-teal-700 dark:text-teal-300 flex items-center gap-2">
            <div className="w-4 h-4 loading-spinner" />
            Generating signs for patient screen…
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 card p-4 flex flex-col min-h-[420px]">
            <h2 className="text-lg font-bold text-theme-primary mb-1">Phrase board</h2>
            <p className="text-xs text-theme-secondary mb-3">
              Tap a phrase — patient screen updates in real time
            </p>
            <PhraseBoard onSelect={handlePhraseSelect} activeId={activePhraseId} compact />
          </div>

          <div className="xl:col-span-4 card p-4 flex flex-col min-h-[280px] max-h-[560px]">
            <h2 className="text-sm font-bold text-theme-primary mb-2">Visit log</h2>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {visitLog.length === 0 ? (
                <p className="text-theme-muted">Staff phrases and patient gestures appear here</p>
              ) : (
                visitLog.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg px-2 py-1.5 border ${
                      entry.side === 'patient' && entry.priority === 'critical'
                        ? 'border-red-300 bg-red-50 dark:bg-red-950/30'
                        : 'border-theme-primary bg-theme-secondary/20'
                    }`}
                  >
                    <span className="text-theme-muted">{entry.time}</span>
                    <span className="mx-1">·</span>
                    <span className="font-medium">{entry.side === 'staff' ? 'Staff' : 'Patient'}</span>
                    <p className="text-theme-primary mt-0.5">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CareStaffView;
