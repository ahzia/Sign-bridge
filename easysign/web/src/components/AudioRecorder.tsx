import { useEffect, useRef, useState } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onClose: () => void;
}

const AudioRecorder = ({ onRecordingComplete, onClose }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const getMimeType = () => {
    const types = ['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/wav'];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Audio recording is not supported in this browser.');
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const updateAudioLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      const mimeType = getMimeType();
      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        audioChunksRef.current = [];
        audioContextRef.current?.close();
        audioContextRef.current = null;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorderRef.current.start();
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch {
      alert('Microphone access was denied. Please enable it in your browser settings.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    mediaRecorderRef.current?.stop();
    setRecordingTime(0);
    setAudioLevel(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 animate-fade-in" />
      <div className="fixed z-50 w-full sm:w-auto left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-theme-modal rounded-2xl shadow-2xl border border-theme-modal p-6 w-full sm:min-w-[340px] max-w-md mx-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-secondary-100 hover:bg-secondary-200 transition-colors text-theme-secondary"
            aria-label="Close recording modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-danger-500 animate-pulse' : 'bg-secondary-400'}`} />
              <span className="font-semibold text-theme-primary">
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </span>
            </div>
            {isRecording && <div className="text-sm font-mono text-theme-secondary">{formatTime(recordingTime)}</div>}
          </div>

          {isRecording && (
            <div className="mb-4 flex items-center justify-center gap-1 h-8">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, (audioLevel / 255) * 32 * Math.random())}px`,
                    backgroundColor: audioLevel > 100 ? 'var(--danger-500)' : 'var(--primary-500)',
                  }}
                />
              ))}
            </div>
          )}

          <p className="text-sm text-theme-secondary text-center mb-4">
            {isRecording ? 'Speak clearly into your microphone' : 'Click the button below to start recording'}
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`text-white rounded-full p-4 shadow-lg transition-all duration-300 ${
                isRecording ? 'bg-danger-500 hover:bg-danger-600' : 'bg-primary-500 hover:bg-primary-600'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="7" width="10" height="10" rx="2" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 013 3v6a3 3 0 11-6 0V4a3 3 0 013-3zm5 10a5 5 0 01-10 0m10 0v2a7 7 0 01-14 0v-2" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-xs text-theme-muted text-center mt-4">
            {isRecording ? 'Click to stop recording' : 'Your voice will be transcribed automatically'}
          </p>
        </div>
      </div>
    </>
  );
};

export default AudioRecorder;
