import React, { useState } from 'react';
import PoseViewer from './PoseViewer';
import VideoExportService from '../services/VideoExportService';

interface AnimationSectionProps {
  poseFile: Blob | null;
  isGeneratingAnimation: boolean;
}

const AnimationSection: React.FC<AnimationSectionProps> = ({ poseFile, isGeneratingAnimation }) => {
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const videoExportService = VideoExportService.getInstance();

  const handleExportVideo = async () => {
    if (!poseFile) return;
    
    setIsExportingVideo(true);
    try {
      const videoBlob = await videoExportService.exportPoseAnimationAsVideo(poseFile, {
        width: 640,
        height: 480,
        fps: 30,
        duration: 5,
        quality: 0.8,
        format: 'webm'
      });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `sign-animation-${timestamp}`;
      await videoExportService.downloadVideo(videoBlob, filename);
    } catch (error) {
      console.error('Failed to export video:', error);
      alert('Failed to export animation as video. Please try again.');
    } finally {
      setIsExportingVideo(false);
    }
  };

  return (
  <div className="xl:col-span-4 h-full">
    <div className="card h-full flex flex-col shadow-md sm:shadow-xl hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 border border-theme-input sm:border-0 rounded-2xl sm:rounded-xl p-2 sm:p-6">
      <div className="pb-3 sm:pb-6 border-b border-theme-primary">
        <div className="flex items-center justify-between mb-1 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-xl sm:rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-theme-primary">
                Animation
              </h2>
              <p className="text-xs sm:text-sm text-theme-secondary">
                Sign language animation
              </p>
            </div>
          </div>
          {poseFile && videoExportService.isSupported() && (
            <button
              onClick={handleExportVideo}
              disabled={isExportingVideo}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:text-indigo-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as Video"
            >
              {isExportingVideo ? (
                <>
                  <div className="w-3 h-3 border border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Export</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 pt-2 sm:pt-6">
        {(!poseFile || isGeneratingAnimation) && (
          <div className="flex items-center justify-between mb-2 sm:mb-4 px-1 sm:px-2">
            <span className="text-[10px] sm:text-xs font-medium text-theme-secondary">
              Animation
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className={`w-2 h-2 rounded-full ${isGeneratingAnimation ? 'bg-warning-500 animate-pulse' : 'bg-secondary-400'}`}></div>
              <span className="text-[10px] sm:text-xs text-theme-secondary">
                {isGeneratingAnimation ? 'Loading' : 'Empty'}
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center h-full">
          {isGeneratingAnimation ? (
            <div className="text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 loading-spinner mx-auto mb-2 sm:mb-4" style={{borderTopColor: 'var(--indigo-500)', borderRightColor: 'var(--indigo-500)'}}></div>
              <p className="text-xs sm:text-sm font-medium text-theme-secondary">Generating animation...</p>
            </div>
          ) : poseFile ? (
            <div className="w-full h-full flex items-center justify-center">
              <PoseViewer poseFile={poseFile} onAnimationComplete={() => {}} isTranslating={isGeneratingAnimation} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full py-6 sm:py-0 text-center text-theme-muted">
              <div className="w-10 h-10 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-4" style={{ background: 'var(--bg-secondary)' }}>
                <svg className="w-5 h-5 sm:w-10 sm:h-10 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">No animation available</p>
              <p className="text-[9px] sm:text-xs">Translate text to see animation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default AnimationSection; 