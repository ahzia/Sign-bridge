import type { HospitalGesture } from '../../data/hospitalGestures';
import { TRIAGE_STYLES } from '../../data/hospitalGestures';

interface GestureAlertOverlayProps {
  gesture: HospitalGesture;
  audience: 'patient' | 'staff';
  onDismiss?: () => void;
}

const PRIORITY_ICONS: Record<string, string> = {
  critical: '🚨',
  high: '⚠️',
  medium: '✋',
  low: '👍',
};

const GestureAlertOverlay = ({ gesture, audience, onDismiss }: GestureAlertOverlayProps) => {
  const style = TRIAGE_STYLES[gesture.priority];
  const isCritical = gesture.priority === 'critical';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      role="alertdialog"
      aria-live="assertive"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={`relative w-full max-w-lg sm:max-w-xl rounded-3xl shadow-2xl border-4 overflow-hidden ${
          isCritical ? 'border-red-500 animate-pulse' : 'border-white/20'
        }`}
      >
        <div className={`${style.banner} px-6 py-4 text-center`}>
          <p className="text-sm sm:text-base font-bold uppercase tracking-widest opacity-90">
            {style.label} {audience === 'staff' ? '— Patient signal' : '— Your signal'}
          </p>
        </div>

        <div
          className={`px-6 py-10 sm:py-14 text-center ${
            isCritical
              ? 'bg-red-50 dark:bg-red-950'
              : gesture.priority === 'high'
                ? 'bg-amber-50 dark:bg-amber-950'
                : 'bg-white dark:bg-slate-900'
          }`}
        >
          <div className="text-6xl sm:text-7xl mb-4" aria-hidden>
            {PRIORITY_ICONS[gesture.priority] ?? '✋'}
          </div>

          <h2
            className={`font-black leading-tight ${
              isCritical
                ? 'text-3xl sm:text-5xl text-red-700 dark:text-red-200'
                : 'text-2xl sm:text-4xl text-theme-primary'
            }`}
          >
            {gesture.label}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-theme-secondary max-w-md mx-auto">
            {audience === 'patient'
              ? isCritical
                ? 'Staff have been alerted. Help is on the way.'
                : 'Staff can see your gesture on their screen.'
              : gesture.staffMessage}
          </p>

          {gesture.hint && audience === 'patient' && (
            <p className="mt-3 text-xs text-theme-muted">Gesture: {gesture.hint}</p>
          )}
        </div>

        {onDismiss && audience === 'staff' && (
          <div className="bg-white dark:bg-slate-900 px-6 py-4 flex flex-col items-center gap-2 border-t border-theme-primary">
            <p className="text-xs text-theme-muted text-center">
              Stays on screen until you acknowledge (up to 3 minutes)
            </p>
            <button
              onClick={onDismiss}
              className="btn btn-secondary text-sm px-8"
            >
              Acknowledge
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestureAlertOverlay;
