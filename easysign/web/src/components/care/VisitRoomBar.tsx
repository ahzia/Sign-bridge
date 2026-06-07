import { useState } from 'react';
import { patientVisitUrl } from '../../services/visitSync';

interface VisitRoomBarProps {
  roomId: string;
  patientOnline?: boolean;
  staffOnline?: boolean;
  role: 'staff' | 'patient';
}

const VisitRoomBar = ({ roomId, patientOnline, staffOnline, role }: VisitRoomBarProps) => {
  const [copied, setCopied] = useState(false);
  const patientUrl = patientVisitUrl(roomId);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(patientUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy patient screen link:', patientUrl);
    }
  };

  const openPatientWindow = () => {
    window.open(patientUrl, 'easysign-patient', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/80 dark:bg-teal-950/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
          Visit room
        </p>
        <p className="text-xl font-bold text-theme-primary tracking-widest">{roomId}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
          {role === 'staff' && (
            <span className={`inline-flex items-center gap-1.5 ${patientOnline ? 'text-emerald-600' : 'text-theme-muted'}`}>
              <span className={`w-2 h-2 rounded-full ${patientOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              Patient screen {patientOnline ? 'connected' : 'waiting…'}
            </span>
          )}
          {role === 'patient' && (
            <span className={`inline-flex items-center gap-1.5 ${staffOnline ? 'text-emerald-600' : 'text-theme-muted'}`}>
              <span className={`w-2 h-2 rounded-full ${staffOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              Staff console {staffOnline ? 'connected' : 'waiting…'}
            </span>
          )}
        </div>
      </div>

      {role === 'staff' && (
        <div className="flex flex-wrap gap-2 shrink-0">
          <button onClick={copyLink} className="btn btn-secondary text-xs py-2">
            {copied ? 'Copied!' : 'Copy patient link'}
          </button>
          <button onClick={openPatientWindow} className="btn btn-primary text-xs py-2 bg-teal-600 hover:bg-teal-700">
            Open patient screen
          </button>
        </div>
      )}
    </div>
  );
};

export default VisitRoomBar;
