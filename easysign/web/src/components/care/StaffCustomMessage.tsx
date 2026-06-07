import { useState } from 'react';
import AudioRecorder from '../AudioRecorder';
import { transcribeAudio } from '../../api/client';

interface StaffCustomMessageProps {
  onSend: (english: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const StaffCustomMessage = ({ onSend, disabled, loading }: StaffCustomMessageProps) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendText = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || loading) return;
    setError(null);
    onSend(trimmed);
    setText('');
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsTranscribing(true);
    setError(null);
    try {
      const transcript = await transcribeAudio(audioBlob);
      if (!transcript.trim()) {
        setError('No speech detected — try again or type your message.');
        return;
      }
      setText(transcript);
      onSend(transcript.trim());
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const busy = disabled || loading || isTranscribing;

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50/80 to-white dark:from-teal-950/40 dark:to-slate-900/50 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-bold text-theme-primary">Custom message</h3>
          <p className="text-xs text-theme-secondary mt-0.5">
            Record your voice or type — sent to patient as sign language
          </p>
        </div>
        <button
          onClick={() => setIsRecording(true)}
          disabled={busy}
          className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a1 1 0 100 2h1.07A7 7 0 0012 22a7 7 0 006.93-6H19a1 1 0 100-2h-2z" />
          </svg>
          Record
        </button>
      </div>

      <textarea
        className="input w-full min-h-[72px] text-sm resize-none"
        placeholder="Type what you want to say to the patient…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendText();
        }}
      />

      <div className="flex items-center justify-between gap-2 mt-2">
        <p className="text-[10px] text-theme-muted">⌘/Ctrl + Enter to send</p>
        <button
          onClick={handleSendText}
          disabled={busy || !text.trim()}
          className="btn btn-primary text-xs py-2 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Sending…' : isTranscribing ? 'Transcribing…' : 'Send to patient'}
        </button>
      </div>

      {isTranscribing && (
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-2 flex items-center gap-2">
          <span className="w-3 h-3 loading-spinner" />
          Converting speech to text…
        </p>
      )}

      {error && <p className="text-xs text-danger-600 mt-2">{error}</p>}

      {isRecording && (
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onClose={() => setIsRecording(false)}
        />
      )}
    </div>
  );
};

export default StaffCustomMessage;
