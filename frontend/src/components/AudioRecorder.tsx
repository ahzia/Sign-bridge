import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  recordingSource: 'mic' | 'system';
  setRecordingSource: (source: 'mic' | 'system') => void;
  onClose: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, recordingSource, setRecordingSource, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    if (recordingSource === 'system') {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('System audio recording is not supported in this environment.');
        setIsRecording(false);
        return;
      }
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
        const audioTracks = displayStream.getAudioTracks();
        if (audioTracks.length === 0) {
          alert('No system audio track available.');
          setIsRecording(false);
          return;
        }
        const audioStream = new MediaStream(audioTracks);
        // Check for supported MIME type
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            mimeType = 'audio/ogg;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
          } else {
            mimeType = '';
          }
        }
        mediaRecorderRef.current = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          onRecordingComplete(audioBlob);
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current.start();
        setRecordingTime(0);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error accessing system audio:', error);
        alert('Failed to capture system audio. Please check permissions.');
        setIsRecording(false);
      }
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Audio recording is not supported in this environment. Please check your Tauri/macOS version and permissions.');
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
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
        }
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

      // Check for supported MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        } else {
          mimeType = '';
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        audioChunksRef.current = [];
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
      mediaRecorderRef.current.start();
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        (error as any).name === 'NotAllowedError'
      ) {
        alert('Microphone access was denied. Please enable it in your system settings.');
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
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
      {/* Blur overlay for entire page */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 animate-fade-in"></div>
      
            {/* Modal positioned in first card */}
      <div className="fixed top-1/2 left-[25%] transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-theme-modal rounded-2xl shadow-2xl border border-theme-modal p-6 min-w-[340px] relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-secondary-100 hover:bg-secondary-200 transition-colors duration-200 text-theme-secondary hover:text-theme-primary"
            aria-label="Close recording modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-danger-500 animate-pulse' : 'bg-secondary-400'}`}></div>
            <span className="font-semibold text-theme-primary">
              {isRecording ? 'Recording...' : 'Ready to Record'}
            </span>
          </div>
          {isRecording && (
            <div className="text-sm font-mono text-theme-secondary">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Source Selection */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150
              ${recordingSource === 'mic' ? 'bg-primary-100 border-primary-400 text-primary-700' : 'bg-secondary-100 border-secondary-300 text-secondary-500'}
            `}
            onClick={() => setRecordingSource('mic')}
            disabled={isRecording}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v22m6-6a6 6 0 01-12 0" /></svg>
            Microphone
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150
              ${recordingSource === 'system' ? 'bg-primary-100 border-primary-400 text-primary-700' : 'bg-secondary-100 border-secondary-300 text-secondary-500'}
            `}
            onClick={() => setRecordingSource('system')}
            disabled={isRecording}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
            System Audio
          </button>
        </div>

        {/* Audio Level Visualization */}
        {isRecording && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-1 h-8">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 bg-secondary-300 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, (audioLevel / 255) * 32 * Math.random())}px`,
                    backgroundColor: audioLevel > 100 ? 'var(--danger-500)' : 'var(--primary-500)'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recording Instructions */}
        <div className="text-center mb-4">
          <p className="text-sm text-theme-secondary">
            {isRecording 
              ? 'Speak clearly into your microphone' 
              : 'Click the button below to start recording'
            }
          </p>
        </div>

        {/* Control Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`relative group transition-all duration-300 ${
              isRecording 
                ? 'bg-danger-500 hover:bg-danger-600 scale-110' 
                : 'bg-primary-500 hover:bg-primary-600 hover:scale-105'
            } text-white rounded-full p-4 shadow-lg hover:shadow-xl`}
          >
            {isRecording ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
            <div className={`absolute inset-0 rounded-full ${
              isRecording 
                ? 'bg-danger-400 animate-ping opacity-75' 
                : 'bg-primary-400 opacity-0 group-hover:opacity-50 transition-opacity'
            }`}></div>
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center mt-4">
          <p className="text-xs text-theme-muted">
            {isRecording 
              ? 'Click to stop recording' 
              : 'Your voice will be transcribed automatically'
            }
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default AudioRecorder;
