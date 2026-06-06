import { useCallback, useState } from 'react';
import PhraseBoard from './PhraseBoard';
import PatientSignOutput from './PatientSignOutput';
import PatientGesturePanel, { type PatientGestureEvent } from './PatientGesturePanel';
import type { ClinicalPhrase } from '../../data/clinicalPhrases';
import type { HospitalGesture } from '../../data/hospitalGestures';
import { TRIAGE_STYLES } from '../../data/hospitalGestures';
import { runEnglishSignPipeline, speakText } from '../../services/runSignPipeline';

interface CareVisitProps {
  onBack: () => void;
}

type CareTab = 'phrases' | 'visit';

interface VisitLogEntry {
  id: string;
  time: string;
  side: 'staff' | 'patient';
  text: string;
  priority?: string;
}

const CareVisit = ({ onBack }: CareVisitProps) => {
  const [tab, setTab] = useState<CareTab>('phrases');
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [english, setEnglish] = useState('');
  const [cantonese, setCantonese] = useState('');
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [poseFile, setPoseFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageAlert, setTriageAlert] = useState<HospitalGesture | null>(null);
  const [visitLog, setVisitLog] = useState<VisitLogEntry[]>([]);

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

  const handlePhraseSelect = async (phrase: ClinicalPhrase) => {
    setActivePhraseId(phrase.id);
    setError(null);
    setLoading(true);
    speakText(phrase.english);

    try {
      const result = await runEnglishSignPipeline(phrase.english);
      setEnglish(result.english);
      setCantonese(phrase.cantonese);
      setSignWriting(result.signWriting);
      setPoseFile(result.poseFile);
      addLog('staff', phrase.english);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate signs');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientGesture = useCallback((event: PatientGestureEvent) => {
    if (event.gesture && event.stability >= 0.5) {
      setTriageAlert(event.gesture);
      setVisitLog((prev) => [
        {
          id: `${Date.now()}-p`,
          time: new Date().toLocaleTimeString(),
          side: 'patient',
          text: event.gesture!.label,
          priority: event.gesture!.priority,
        },
        ...prev.slice(0, 19),
      ]);
    } else if (!event.rawGesture || event.rawGesture === 'None') {
      setTriageAlert(null);
    }
  }, []);

  const dismissTriage = () => setTriageAlert(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/20">
      <header className="glass border-b border-teal-200 dark:border-teal-900 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent truncate">
                  EasySign Care
                </h1>
                <p className="text-xs text-theme-secondary hidden sm:block">
                  Staff → patient communication for clinical visits
                </p>
              </div>
            </div>
            <button onClick={onBack} className="btn btn-secondary text-sm shrink-0">
              ← Main app
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTab('phrases')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'phrases'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-theme-secondary text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Phrase board
            </button>
            <button
              onClick={() => setTab('visit')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'visit'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-theme-secondary text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Live visit
            </button>
          </div>
        </div>
      </header>

      {triageAlert && tab === 'visit' && (
        <div className={`${TRIAGE_STYLES[triageAlert.priority].banner} px-4 py-3`}>
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-sm">
                {TRIAGE_STYLES[triageAlert.priority].label} priority — {triageAlert.label}
              </p>
              <p className="text-sm opacity-95 mt-0.5">{triageAlert.staffMessage}</p>
            </div>
            <button
              onClick={dismissTriage}
              className="text-white/90 hover:text-white text-xs underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-800">{error}</div>
        )}

        {tab === 'phrases' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'calc(100vh - 220px)' }}>
            <div className="card p-4 flex flex-col">
              <h2 className="text-lg font-bold text-theme-primary mb-1">Staff phrase board</h2>
              <p className="text-xs text-theme-secondary mb-3">
                Tap a phrase — it is spoken aloud and shown as sign language to the patient
              </p>
              <PhraseBoard onSelect={handlePhraseSelect} activeId={activePhraseId} />
            </div>
            <div className="card p-4 flex flex-col">
              <h2 className="text-lg font-bold text-theme-primary mb-3">Patient view</h2>
              <PatientSignOutput
                english={english}
                cantonese={cantonese}
                signWriting={signWriting}
                poseFile={poseFile}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-5 card p-4 flex flex-col min-h-[320px]">
                <h2 className="text-lg font-bold text-theme-primary mb-1">Staff</h2>
                <p className="text-xs text-theme-secondary mb-3">Select what to say to the patient</p>
                <PhraseBoard onSelect={handlePhraseSelect} activeId={activePhraseId} compact />
              </div>
              <div className="xl:col-span-4 card p-4 flex flex-col min-h-[320px]">
                <h2 className="text-lg font-bold text-theme-primary mb-1">Patient</h2>
                <p className="text-xs text-theme-secondary mb-3">Camera + hospital gesture pack</p>
                <PatientGesturePanel onGesture={handlePatientGesture} compact />
              </div>
              <div className="xl:col-span-3 card p-4 flex flex-col min-h-[200px] max-h-[480px]">
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

            <div className="card p-4">
              <h2 className="text-lg font-bold text-theme-primary mb-3">Sign output (patient screen)</h2>
              <PatientSignOutput
                english={english}
                cantonese={cantonese}
                signWriting={signWriting}
                poseFile={poseFile}
                loading={loading}
                emptyMessage="Select a phrase on the left to show signs to the patient"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CareVisit;
