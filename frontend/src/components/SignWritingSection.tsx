import React from 'react';
import SignWritingDisplay from './SignWritingDisplay';

interface SignWritingSectionProps {
  signWriting: string[];
  isGeneratingSigns: boolean;
}

const SignWritingSection: React.FC<SignWritingSectionProps> = ({ signWriting, isGeneratingSigns }) => (
  <div className="xl:col-span-3 h-full">
    <div className="card h-full flex flex-col bg-white dark:bg-theme-secondary shadow-sm sm:shadow-xl hover:shadow-md sm:hover:shadow-2xl transition-all duration-300 border border-theme-input sm:border-0 rounded-2xl sm:rounded-xl p-2 sm:p-6">
      <div className="pb-3 sm:pb-6 border-b border-theme-primary">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-xl sm:rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-theme-primary">
              SignWriting
            </h2>
            <p className="text-xs sm:text-xs text-theme-secondary">
              Visual notation system
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 pt-2 sm:pt-6">
        <div className="flex items-center justify-between mb-2 sm:mb-4 px-1 sm:px-2">
          <span className="text-[10px] sm:text-xs font-medium text-theme-secondary">
            {isGeneratingSigns ? 'Processing...' : `${signWriting.length} sign${signWriting.length !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isGeneratingSigns ? 'bg-warning-500 animate-pulse' : signWriting.length > 0 ? 'bg-success-500' : 'bg-secondary-400'}`}></div>
            <span className="text-[10px] sm:text-xs text-theme-secondary">
              {isGeneratingSigns ? 'Loading' : signWriting.length > 0 ? 'Ready' : 'Empty'}
            </span>
          </div>
        </div>
        {isGeneratingSigns ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 loading-spinner mx-auto mb-2 sm:mb-4" style={{borderTopColor: 'var(--purple-500)', borderRightColor: 'var(--purple-500)'}}></div>
              <p className="text-xs sm:text-sm font-medium text-theme-secondary">Processing signs...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="h-full max-h-[350px] overflow-y-auto px-2">
              <div className={signWriting.length === 0 ? 'flex justify-center items-center h-full w-full' : ''}>
                <SignWritingDisplay
                  fswTokens={signWriting.length === 0 ? [] : signWriting}
                  direction="col"
                  className="w-full min-w-0 flex-col overflow-y-auto h-full"
                  signSize={24}
                />
              </div>
            </div>
            {signWriting.length > 0 && (
              <div className="mt-4 px-2">
                <div className="text-center">
                  <p className="text-xs text-theme-muted">
                    Hover for details • Scroll for more
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default SignWritingSection; 