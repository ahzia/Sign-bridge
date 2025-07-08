import React, { useEffect, useRef, useState } from 'react';

interface PoseViewerProps {
  poseFile?: Blob | Uint8Array;
  poseUrl?: string;
  onAnimationComplete?: () => void;
  isTranslating?: boolean;
}

const PoseViewer: React.FC<PoseViewerProps> = ({ poseFile, poseUrl, onAnimationComplete, isTranslating }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(poseUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Dynamically import and define the pose-viewer web component
    const loadPoseViewer = async () => {
      try {
        setLoading(true);
        const { defineCustomElements } = await import('pose-viewer/loader');
        defineCustomElements();
        setLoading(false);
      } catch (err) {
        console.error('Failed to load pose-viewer:', err);
        setError('Failed to load animation viewer');
        setLoading(false);
      }
    };
    
    loadPoseViewer();
  }, []);

  useEffect(() => {
    // If a poseFile is provided, create an object URL
    if (poseFile) {
      try {
        const blob = poseFile instanceof Blob ? poseFile : new Blob([poseFile], { type: 'application/octet-stream' });
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setError(null);
        return () => URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.error('Failed to create object URL:', err);
        setError('Failed to load animation file');
        setUrl(null);
      }
    } else if (poseUrl) {
      setUrl(poseUrl);
      setError(null);
    } else {
      setUrl(null);
      setError(null);
    }
  }, [poseFile, poseUrl]);

  useEffect(() => {
    // Listen for animation events
    const poseViewer = containerRef.current?.querySelector('pose-viewer');
    if (poseViewer) {
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
    }
  }, [onAnimationComplete, url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-6 h-6 loading-spinner" style={{borderTopColor: 'var(--primary-500)', borderRightColor: 'var(--primary-500)', borderWidth: '2px'}}></div>
          </div>
          <p className="text-sm text-theme-secondary font-medium">
            Loading Animation Viewer...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: 'var(--bg-danger)' }}>
            <svg className="w-6 h-6 text-danger-600 dark:text-danger-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-danger-600 font-medium mb-2">
            {error}
          </p>
          <p className="text-xs text-theme-muted">
            Try translating again
          </p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
            <svg className="w-8 h-8 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-theme-secondary font-medium mb-1">
            No Animation Available
          </p>
          <p className="text-xs text-theme-muted">
            Translate text to see 3D animation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with status */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-xs font-medium text-theme-secondary">
          Animation
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTranslating ? 'bg-warning-500 animate-pulse' : isPlaying ? 'bg-success-500 animate-pulse' : 'bg-success-500'}`}></div>
          <span className="text-xs text-theme-secondary">
            {isTranslating ? 'Loading' : isPlaying ? 'Playing' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Animation Container */}
      <div className="flex-1 relative overflow-hidden rounded-lg bg-theme-secondary border border-theme-primary">
        <div ref={containerRef} className="pose-viewer-container h-full w-full">
          <pose-viewer
            src={url}
            autoplay
            aspect-ratio="1"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              borderRadius: '8px',
            }}
            className="w-full h-full"
          />
        </div>

        {/* Overlay controls */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <button
            onClick={() => {
              const poseViewer = containerRef.current?.querySelector('pose-viewer') as any;
              if (poseViewer) {
                if (isPlaying) {
                  poseViewer.pause();
                } else {
                  poseViewer.play();
                }
              }
            }}
            className="text-white hover:text-white/70 transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => {
              const poseViewer = containerRef.current?.querySelector('pose-viewer') as any;
              if (poseViewer) {
                poseViewer.currentTime = 0;
                poseViewer.play();
              }
            }}
            className="text-white hover:text-white/70 transition-colors"
            title="Restart"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer with instructions */}
      <div className="mt-4 px-2">
        <div className="text-center">
          <p className="text-xs text-theme-muted">
            Use controls to play/pause/restart animation
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoseViewer;
