import { useState, useRef, useEffect, useCallback } from 'react';

export type RecordingSource = 'mic' | 'system';

interface UseAudioRecorderOptions {
  recordingSource: RecordingSource;
  onRecordingComplete: (audioBlob: Blob) => void;
}

export function useAudioRecorder({ recordingSource, onRecordingComplete }: UseAudioRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Start recording logic
  const startRecording = useCallback(async () => {
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
  }, [recordingSource, onRecordingComplete]);

  // Stop recording logic
  const stopRecording = useCallback(() => {
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
  }, []);

  // Effect to start/stop recording
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Cleanup on unmount
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

  return {
    isRecording,
    setIsRecording,
    recordingTime,
    audioLevel,
    startRecording: () => setIsRecording(true),
    stopRecording: () => setIsRecording(false),
  };
} 