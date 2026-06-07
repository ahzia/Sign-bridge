import SignWritingPanel from '../SignWritingPanel';
import PoseViewer from '../PoseViewer';

interface PatientSignOutputProps {
  english: string;
  cantonese?: string;
  signWriting: string[];
  poseFile: Blob | null;
  loading: boolean;
  emptyMessage?: string;
  variant?: 'default' | 'kiosk';
}

const PatientSignOutput = ({
  english,
  cantonese,
  signWriting,
  poseFile,
  loading,
  emptyMessage = 'Select a phrase to show sign language to the patient',
  variant = 'default',
}: PatientSignOutputProps) => {
  const isKiosk = variant === 'kiosk';

  return (
    <div className={`flex flex-col h-full ${isKiosk ? 'gap-5' : 'gap-4'}`}>
      {english ? (
        <div
          className={`rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 ${
            isKiosk ? 'p-5 sm:p-6 text-center' : 'p-4'
          }`}
        >
          {!isKiosk && (
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-1">
              Showing patient
            </p>
          )}
          <p className={`font-semibold text-theme-primary ${isKiosk ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
            {english}
          </p>
          {cantonese && (
            <p className={`text-theme-secondary mt-1 ${isKiosk ? 'text-base sm:text-lg' : 'text-sm'}`}>
              {cantonese}
            </p>
          )}
        </div>
      ) : (
        <div
          className={`rounded-xl border border-dashed border-theme-primary text-center text-theme-muted ${
            isKiosk ? 'p-10 text-base' : 'p-6 text-sm'
          }`}
        >
          {emptyMessage}
        </div>
      )}

      <div
        className={`flex-1 min-h-0 ${
          isKiosk ? 'flex flex-col gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }`}
      >
        <div className={`card p-3 flex flex-col ${isKiosk ? 'min-h-[280px] sm:min-h-[360px] order-1' : 'min-h-[180px]'}`}>
          <h3 className="text-sm font-bold text-theme-primary mb-2">Sign animation</h3>
          <div className={`flex-1 ${isKiosk ? 'min-h-[220px] sm:min-h-[300px]' : 'min-h-[140px]'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 loading-spinner" />
              </div>
            ) : (
              <PoseViewer poseFile={poseFile ?? undefined} isTranslating={loading} />
            )}
          </div>
        </div>
        <div className={`card p-3 flex flex-col ${isKiosk ? 'min-h-[120px] order-2' : 'min-h-[180px]'}`}>
          <h3 className="text-sm font-bold text-theme-primary mb-2">SignWriting</h3>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 loading-spinner" />
              </div>
            ) : (
              <SignWritingPanel fswTokens={signWriting} signSize={isKiosk ? 48 : 40} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignOutput;
