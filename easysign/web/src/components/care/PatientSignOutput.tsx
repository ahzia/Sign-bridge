import SignWritingPanel from '../SignWritingPanel';
import PoseViewer from '../PoseViewer';

interface PatientSignOutputProps {
  english: string;
  cantonese?: string;
  signWriting: string[];
  poseFile: Blob | null;
  loading: boolean;
  emptyMessage?: string;
}

const PatientSignOutput = ({
  english,
  cantonese,
  signWriting,
  poseFile,
  loading,
  emptyMessage = 'Select a phrase to show sign language to the patient',
}: PatientSignOutputProps) => (
  <div className="flex flex-col h-full gap-4">
    {english ? (
      <div className="rounded-xl bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300 mb-1">
          Showing patient
        </p>
        <p className="text-lg font-semibold text-theme-primary">{english}</p>
        {cantonese && <p className="text-sm text-theme-secondary mt-1">{cantonese}</p>}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-theme-primary p-6 text-center text-sm text-theme-muted">
        {emptyMessage}
      </div>
    )}

    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
      <div className="card p-3 flex flex-col min-h-[180px]">
        <h3 className="text-sm font-bold text-theme-primary mb-2">SignWriting</h3>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 loading-spinner" />
            </div>
          ) : (
            <SignWritingPanel fswTokens={signWriting} signSize={40} />
          )}
        </div>
      </div>
      <div className="card p-3 flex flex-col min-h-[180px]">
        <h3 className="text-sm font-bold text-theme-primary mb-2">Sign animation</h3>
        <div className="flex-1 min-h-[140px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 loading-spinner" />
            </div>
          ) : (
            <PoseViewer poseFile={poseFile ?? undefined} isTranslating={loading} />
          )}
        </div>
      </div>
    </div>
  </div>
);

export default PatientSignOutput;
