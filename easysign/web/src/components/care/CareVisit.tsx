import { useState } from 'react';
import PhraseBoard from './PhraseBoard';
import PatientSignOutput from './PatientSignOutput';
import type { ClinicalPhrase } from '../../data/clinicalPhrases';
import { useNavigate } from '../../hooks/usePathname';
import { generateRoomId, patientVisitUrl } from '../../services/visitSync';
import { runEnglishSignPipeline, speakText } from '../../services/runSignPipeline';

type CareTab = 'phrases' | 'live';

const CareVisit = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<CareTab>('phrases');
  const [liveRoomId, setLiveRoomId] = useState(() => generateRoomId());
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);
  const [english, setEnglish] = useState('');
  const [cantonese, setCantonese] = useState('');
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [poseFile, setPoseFile] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate signs');
    } finally {
      setLoading(false);
    }
  };

  const startLiveVisit = () => {
    const room = generateRoomId();
    setLiveRoomId(room);
    navigate(`/care/staff?room=${room}`);
  };

  const openPatientWindow = () => {
    window.open(patientVisitUrl(liveRoomId), 'easysign-patient', 'noopener,noreferrer');
  };

  const copyPatientLink = async () => {
    try {
      await navigator.clipboard.writeText(patientVisitUrl(liveRoomId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy patient screen link:', patientVisitUrl(liveRoomId));
    }
  };

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
            <button onClick={() => navigate('/')} className="btn btn-secondary text-sm shrink-0">
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
              onClick={() => setTab('live')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === 'live'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-theme-secondary text-theme-secondary hover:text-theme-primary'
              }`}
            >
              Dual-screen visit
            </button>
          </div>
        </div>
      </header>

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
              <h2 className="text-lg font-bold text-theme-primary mb-3">Patient preview</h2>
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
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="card p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-theme-primary">Dual-screen live visit</h2>
                <p className="text-sm text-theme-secondary mt-1">
                  Use two browser windows side by side on one laptop, or put the patient screen on a second monitor.
                  Both stay in sync in real time.
                </p>
              </div>

              <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 p-4">
                <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Visit room</p>
                <p className="text-2xl font-bold tracking-widest text-theme-primary mt-1">{liveRoomId}</p>
              </div>

              <div className="space-y-2">
                <button onClick={startLiveVisit} className="btn btn-primary w-full bg-teal-600 hover:bg-teal-700">
                  Open staff console
                </button>
                <button onClick={openPatientWindow} className="btn btn-secondary w-full">
                  Open patient screen (new window)
                </button>
                <button onClick={copyPatientLink} className="btn btn-secondary w-full text-sm">
                  {copied ? 'Patient link copied!' : 'Copy patient screen link'}
                </button>
              </div>
            </div>

            <div className="card p-5 text-sm text-theme-secondary space-y-3">
              <p className="font-semibold text-theme-primary">Recording / demo setup</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Click <strong>Open staff console</strong> — use this on the left half of your screen.</li>
                <li>Click <strong>Open patient screen</strong> — snap it to the right (or drag to a second monitor).</li>
                <li>On staff: tap a phrase. Patient screen updates with signs and speech.</li>
                <li>On patient: use gestures (closed fist = emergency) — staff sees triage alerts.</li>
              </ol>
              <p className="text-xs text-theme-muted pt-1">
                Tip: use two separate windows (not two tabs in one window) for easier split-screen recording.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CareVisit;
