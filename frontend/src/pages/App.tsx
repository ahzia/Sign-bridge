import React, { useState, useEffect, useRef } from 'react';
import AudioRecorder from '../components/AudioRecorder';
import SignWritingDisplay from '../components/SignWritingDisplay';
import PoseViewer from '../components/PoseViewer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import ApiService, { type TranscribeResponse, type SimplifyTextResponse, type TranslateSignWritingResponse, type GeneratePoseResponse } from '../services/ApiService';
import '../index.css';
import Header from '../components/Header';
import InputSection from '../components/InputSection';

// Simple Modal for text choice
const SimplifyChoiceModal = ({ original, simplified, onSelect, onClose }: { original: string, simplified: string, onSelect: (choice: 'original' | 'simplified') => void, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white dark:bg-theme-modal rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
      <button onClick={onClose} className="absolute top-3 right-3 text-theme-secondary hover:text-theme-primary">✕</button>
      <h2 className="text-lg font-bold mb-4">Choose Text for Translation</h2>
      <div className="mb-4">
        <div className="mb-2 font-semibold">Original:</div>
        <div className="p-2 bg-theme-secondary rounded mb-4 whitespace-pre-wrap">{original}</div>
        <div className="mb-2 font-semibold">Simplified:</div>
        <div className="p-2 bg-primary-50 dark:bg-primary-900 dark:text-white rounded whitespace-pre-wrap">{simplified}</div>
      </div>
      <div className="text-xs font-bold mb-4" style={{ color: 'var(--success-600, #16a34a)' }}>
        This simplification is powered by <span style={{ color: 'var(--danger-600, #dc2626)' }}>Grok</span> and <span style={{ color: 'var(--danger-600, #dc2626)' }}>Llama AI</span> models.
      </div>
      <div className="flex gap-4 justify-end mt-6">
        <button
          onClick={() => onSelect('original')}
          className="px-4 py-2 rounded bg-secondary-200 hover:bg-secondary-300 text-theme-primary font-semibold dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-white"
        >
          Use Original
        </button>
        <button onClick={() => onSelect('simplified')} className="px-4 py-2 rounded bg-primary-500 hover:bg-primary-600 text-white font-semibold">Use Simplified</button>
      </div>
    </div>
  </div>
);

function App() {
  const [inputText, setInputText] = useState('');
  const [transcription, setTranscription] = useState('');
  const [simplifyText, setSimplifyText] = useState(false);
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [poseFile, setPoseFile] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSigns, setIsGeneratingSigns] = useState(false);
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingSource, setRecordingSource] = useState<'mic' | 'system'>('mic');
  const [showSimplifyModal, setShowSimplifyModal] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState('');
  const [pendingOriginalText, setPendingOriginalText] = useState('');

  const { theme, toggleTheme } = useTheme();
  const translationTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (translationTimeout.current) {
      clearTimeout(translationTimeout.current);
    }
    if (inputText.trim() === '') {
      setSignWriting([]);
      setPoseFile(null);
      setTranscription('');
      return;
    }

    if (!simplifyText) {
      translationTimeout.current = setTimeout(() => {
        if (/[.!?\n]$/.test(inputText.trim())) {
          triggerTranslation(inputText);
        }
      }, 1500);
    }
  }, [inputText]);

  const triggerTranslation = async (text: string) => {
    setIsTranslating(true);
    setIsGeneratingSigns(true);
    setIsGeneratingAnimation(true);
    setError(null);
    setTranscription(text);
    setSignWriting([]);
    setPoseFile(null);
    
    try {
      let textToTranslate = text;
      if (simplifyText) {
        const simplifyResponse = await ApiService.simplifyText(text);
        textToTranslate = simplifyResponse.simplified_text || text;
      }
      
      // 1. Translate to SignWriting
      const translateResponse = await ApiService.translateSignWriting(textToTranslate);
      const rawFsw = translateResponse.signwriting || '';
      const fswTokens = rawFsw.trim().split(/\s+/).filter(token => token.length > 0);
      setSignWriting(fswTokens);
      setIsGeneratingSigns(false);

      // 2. Generate pose file for animation
      if (fswTokens.length > 0) {
        try {
          const poseResponse = await ApiService.generatePose(textToTranslate, 'en', 'ase');
          const { pose_data, data_format } = poseResponse;
          if (data_format === 'binary_base64' && pose_data) {
            const binary = atob(pose_data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/octet-stream' });
            setPoseFile(blob);
          } else {
            setPoseFile(null);
          }
        } catch {
          setPoseFile(null);
        }
      }
      setIsGeneratingAnimation(false);
    } catch {
      setError('Translation failed. Please try again.');
      setSignWriting([]);
      setPoseFile(null);
      setIsGeneratingSigns(false);
      setIsGeneratingAnimation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRecordComplete = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsTranscribing(true);
    setError(null);
    setInputText('');
    setSignWriting([]);
    setPoseFile(null);
    setTranscription('');
    try {
      const transcribeResponse = await ApiService.transcribe(audioBlob);
      const originalText = transcribeResponse.text || '';
      setInputText(originalText);
      setIsTranscribing(false);
      triggerTranslation(originalText);
    } catch {
      setError('Transcription failed. Please try again.');
      setIsTranscribing(false);
    }
  };

  const handleRecordClick = () => {
    setError(null);
    setIsRecording(!isRecording);
  };

  const handleSimplifyAndTranslate = async () => {
    setError(null);
    setIsTranslating(true);
    try {
      const response = await ApiService.simplifyText(inputText);
      setSimplifiedText(response.simplified_text || inputText);
      setPendingOriginalText(inputText);
      setShowSimplifyModal(true);
    } catch {
      setError('Failed to simplify text.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSimplifyModalSelect = (choice: 'original' | 'simplified') => {
    setShowSimplifyModal(false);
    if (choice === 'simplified') {
      setInputText(simplifiedText);
      setTimeout(() => triggerTranslation(simplifiedText), 0);
    } else {
      setTimeout(() => triggerTranslation(pendingOriginalText), 0);
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        simplifyText={simplifyText}
        setSimplifyText={setSimplifyText}
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" style={{height: 'calc(100vh - 160px)'}}>
          
          {/* Input Section - Enhanced */}
          <InputSection
            inputText={inputText}
            setInputText={setInputText}
            isTranscribing={isTranscribing}
            isRecording={isRecording}
            handleRecordClick={handleRecordClick}
            handleSimplifyAndTranslate={handleSimplifyAndTranslate}
            triggerTranslation={triggerTranslation}
            simplifyText={simplifyText}
            isTranslating={isTranslating}
          />

          {/* SignWriting Display - Enhanced */}
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
                {/* Status and counter - positioned outside scrollable area, always visible */}
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
                    {/* Unified: placeholder or signs, always column, always scrollable */}
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
                    {/* Footer with instructions - only show when there are signs */}
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

          {/* Animation Section - Enhanced */}
          <div className="xl:col-span-4 h-full">
            <div className="card h-full flex flex-col shadow-md sm:shadow-xl hover:shadow-lg sm:hover:shadow-2xl transition-all duration-300 border border-theme-input sm:border-0 rounded-2xl sm:rounded-xl p-2 sm:p-6">
              <div className="pb-3 sm:pb-6 border-b border-theme-primary">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-3">
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
              </div>
              
              <div className="flex-1 pt-2 sm:pt-6">
                {/* Status bar - show when no animation or when translating */}
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 animate-fade-in">
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-danger-800 font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transcription Display */}
        {transcription && (
          <div className="mt-6 animate-fade-in hidden sm:block">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-primary-800 font-medium mb-1">Transcription</p>
                  <p className="text-primary-700 text-sm">{transcription}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Audio Recorder Component */}
      {isRecording && (
        <AudioRecorder
          onRecordingComplete={handleRecordComplete}
          recordingSource={recordingSource}
          setRecordingSource={setRecordingSource}
          onClose={() => setIsRecording(false)}
        />
      )}
      {/* Simplify Choice Modal */}
      {showSimplifyModal && (
        <SimplifyChoiceModal
          original={pendingOriginalText}
          simplified={simplifiedText}
          onSelect={handleSimplifyModalSelect}
          onClose={() => setShowSimplifyModal(false)}
        />
      )}
    </div>
  );
}

export default App;