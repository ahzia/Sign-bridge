import { useState } from 'react';
import { useNavigate } from '../../hooks/usePathname';
import { generateRoomId, patientVisitUrl } from '../../services/visitSync';

const CareVisit = () => {
  const navigate = useNavigate();
  const [liveRoomId, setLiveRoomId] = useState(() => generateRoomId());
  const [copied, setCopied] = useState(false);

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
                  Live staff ↔ patient visits
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/')} className="btn btn-secondary text-sm shrink-0">
              ← Main app
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-theme-primary">Start a live visit</h2>
            <p className="text-sm text-theme-secondary mt-1">
              Open staff and patient screens side by side on one laptop, or use a second monitor.
              Phrase board, custom voice, and gestures — all in the staff console.
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
          <p className="font-semibold text-theme-primary">Quick setup</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click <strong>Open staff console</strong> — snap to the left side of your screen.</li>
            <li>Click <strong>Open patient screen</strong> — snap to the right or drag to a second monitor.</li>
            <li>Staff: use preset phrases or record a custom message — patient sees sign animation.</li>
            <li>Patient: show gestures (closed fist = emergency) — staff gets triage alerts.</li>
          </ol>
          <p className="text-xs text-theme-muted pt-1">
            Tip: use two separate windows for easier split-screen recording.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CareVisit;
