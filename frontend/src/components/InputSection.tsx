import React from 'react';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  isTranscribing: boolean;
  isRecording: boolean;
  handleRecordClick: () => void;
  handleSimplifyAndTranslate: () => void;
  triggerTranslation: (text: string) => void;
  simplifyText: boolean;
  isTranslating: boolean;
}

// Common ActionButton component for reuse
export const ActionButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color: 'primary' | 'success';
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ onClick, disabled, loading, color, children, ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group relative flex-1 ${
      color === 'success'
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
    } text-white font-semibold p-2 sm:py-4 sm:px-6 rounded-xl sm:rounded-xl shadow-sm sm:shadow-lg hover:shadow-md sm:hover:shadow-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-base min-w-0`}
    aria-label={ariaLabel}
  >
    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    <div className="relative flex items-center justify-center">
      {loading ? (
        <>
          <div className="w-7 h-7 sm:w-5 sm:h-5 loading-spinner" style={{borderTopColor: 'white', borderRightColor: 'white', borderWidth: '2px'}}></div>
          <span className="hidden sm:inline ml-2">Loading...</span>
        </>
      ) : (
        children
      )}
    </div>
  </button>
);

const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  setInputText,
  isTranscribing,
  isRecording,
  handleRecordClick,
  handleSimplifyAndTranslate,
  triggerTranslation,
  simplifyText,
  isTranslating,
}) => (
  <div className="xl:col-span-5 h-full">
    <div className="card h-full flex flex-col bg-white dark:bg-theme-secondary shadow-sm sm:shadow-xl hover:shadow-md sm:hover:shadow-2xl transition-all duration-300 border border-theme-input sm:border-0 rounded-2xl sm:rounded-xl p-2 sm:p-6">
      <div className="pb-3 sm:pb-6 border-b border-theme-primary">
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-xl sm:rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-theme-primary">
              Input Text
            </h2>
            <p className="text-xs sm:text-sm text-theme-secondary">
              Type or speak your message to translate
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col pt-2 sm:pt-6">
        {isTranscribing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 sm:w-16 sm:h-16 loading-spinner mx-auto mb-2 sm:mb-4"></div>
              <p className="text-xs sm:text-sm font-medium text-theme-secondary mb-1 sm:mb-2">Processing voice recording...</p>
              <p className="text-[10px] sm:text-xs text-theme-muted">Converting speech to text</p>
            </div>
          </div>
        ) : (
          <div className="relative flex-1">
            <textarea
              className="w-full h-full resize-none bg-theme-input border border-theme-input sm:border-2 rounded-xl sm:rounded-xl p-2 sm:p-4 text-theme-primary placeholder-theme-placeholder focus:border-primary-500 focus:ring-2 sm:focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 text-sm sm:text-base leading-relaxed min-h-[120px] sm:min-h-[180px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here or use voice recording to get started..."
              aria-label="Input text for translation"
            />
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-theme-muted">
              <span>{inputText.length} characters</span>
              <div className="w-1 h-1 bg-secondary-300 rounded-full"></div>
              <span>Press Enter to translate</span>
            </div>
          </div>
        )}
        {/* Enhanced Action Buttons */}
        <div className="flex flex-row gap-2 sm:gap-4 mt-3 sm:mt-6">
          <ActionButton
            onClick={handleRecordClick}
            disabled={isRecording || isTranscribing}
            loading={false}
            color="success"
            ariaLabel="Start recording"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="hidden sm:inline ml-2">{isRecording ? 'Recording...' : 'Record Voice'}</span>
            </div>
          </ActionButton>
          <ActionButton
            onClick={simplifyText ? handleSimplifyAndTranslate : () => triggerTranslation(inputText)}
            disabled={isTranslating || isTranscribing || inputText.trim() === ''}
            loading={isTranslating}
            color="primary"
            ariaLabel={simplifyText ? 'Simplify and translate text' : 'Translate text'}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <span className="hidden sm:inline ml-2">{simplifyText ? 'Simplify & Translate' : 'Translate'}</span>
            </div>
          </ActionButton>
        </div>
      </div>
    </div>
  </div>
);

export default InputSection; 