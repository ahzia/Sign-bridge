import { useEffect, useRef, useState } from 'react';

interface PoseViewerProps {
  poseFile?: Blob | Uint8Array;
  poseUrl?: string;
  onAnimationComplete?: () => void;
  isTranslating?: boolean;
}

const PoseViewer = ({ poseFile, poseUrl, onAnimationComplete, isTranslating }: PoseViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(poseUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadPoseViewer = async () => {
      try {
        setLoading(true);
        const { defineCustomElements } = await import('pose-viewer/loader');
        defineCustomElements();
      } catch {
        setError('Failed to load animation viewer');
      } finally {
        setLoading(false);
      }
    };
    loadPoseViewer();
  }, []);

  useEffect(() => {
    if (poseFile) {
      const blob = poseFile instanceof Blob ? poseFile : new Blob([poseFile], { type: 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      setError(null);
      return () => URL.revokeObjectURL(objectUrl);
    }
    if (poseUrl) {
      setUrl(poseUrl);
      setError(null);
    } else {
      setUrl(null);
    }
  }, [poseFile, poseUrl]);

  useEffect(() => {
    const poseViewer = containerRef.current?.querySelector('pose-viewer');
    if (!poseViewer) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onAnimationComplete?.();
    };

    poseViewer.addEventListener('play', handlePlay);
    poseViewer.addEventListener('pause', handlePause);
    poseViewer.addEventListener('ended', handleEnded);
    return () => {
      poseViewer.removeEventListener('play', handlePlay);
      poseViewer.removeEventListener('pause', handlePause);
      poseViewer.removeEventListener('ended', handleEnded);
    };
  }, [onAnimationComplete, url]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 loading-spinner" /></div>;
  }

  if (error) {
    return <p className="text-sm text-danger-600 text-center">{error}</p>;
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-sm text-theme-secondary font-medium">No animation available</p>
        <p className="text-xs text-theme-muted">Translate text to see animation</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-xs font-medium text-theme-secondary">Animation</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTranslating ? 'bg-warning-500 animate-pulse' : isPlaying ? 'bg-success-500 animate-pulse' : 'bg-success-500'}`} />
          <span className="text-xs text-theme-secondary">{isTranslating ? 'Loading' : isPlaying ? 'Playing' : 'Ready'}</span>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden rounded-lg bg-theme-secondary border border-theme-primary">
        <div ref={containerRef} className="h-full w-full">
          <pose-viewer src={url} autoplay aspect-ratio="1" style={{ width: '100%', height: '100%', display: 'block', borderRadius: '8px' }} />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <button
            onClick={() => {
              const viewer = containerRef.current?.querySelector('pose-viewer') as HTMLMediaElement & { play: () => void; pause: () => void };
              if (!viewer) return;
              isPlaying ? viewer.pause() : viewer.play();
            }}
            className="text-white text-xs"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              const viewer = containerRef.current?.querySelector('pose-viewer') as HTMLMediaElement & { currentTime: number; play: () => void };
              if (!viewer) return;
              viewer.currentTime = 0;
              viewer.play();
            }}
            className="text-white text-xs"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoseViewer;
