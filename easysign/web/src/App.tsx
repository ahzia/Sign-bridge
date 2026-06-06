import { useEffect, useRef, useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import SignWritingPanel from './components/SignWritingPanel';
import PoseViewer from './components/PoseViewer';
import ModeToggle, { type AppMode } from './components/ModeToggle';
import {
  generatePose,
  transcribeAudio,
  transcribeCantoneseAudio,
  translateSignWriting,
  translateToEnglish,
} from './api/client';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<AppMode>('english');
  const [inputText, setInputText] = useState('');
  const [transcription, setTranscription] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [poseFile, setPoseFile] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSigns, setIsGeneratingSigns] = useState(false);
  const [isGeneratingAnimation, setIsGeneratingAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetOutputs = () => {
    setSignWriting([]);
    setPoseFile(null);
    setTranscription('');
    setOriginalText('');
    setEnglishText('');
  };

  useEffect(() => {
    if (translationTimeout.current) clearTimeout(translationTimeout.current);
    if (inputText.trim() === '') {
      resetOutputs();
      return;
    }
    translationTimeout.current = setTimeout(() => {
      if (/[.!?\n]$/.test(inputText.trim())) runTranslation(inputText);
    }, 1500);
  }, [inputText, mode]);

  const runSignPipeline = async (english: string, displayTranscript: string, sourceText?: string) => {
    setIsTranslating(true);
    setIsGeneratingSigns(true);
    setIsGeneratingAnimation(true);
    setError(null);
    setTranscription(displayTranscript);
    setSignWriting([]);
    setPoseFile(null);

    if (mode === 'hongkong' && sourceText) {
      setOriginalText(sourceText);
      setEnglishText(english);
    } else {
      setOriginalText('');
      setEnglishText('');
    }

    try {
      const tokens = await translateSignWriting(english);
      setSignWriting(tokens);
      setIsGeneratingSigns(false);
      if (tokens.length > 0) setPoseFile(await generatePose(english));
    } catch {
      setError('Translation failed. Please try again.');
      setSignWriting([]);
      setPoseFile(null);
    } finally {
      setIsTranslating(false);
      setIsGeneratingSigns(false);
      setIsGeneratingAnimation(false);
    }
  };

  const runTranslation = async (text: string) => {
    if (mode === 'hongkong') {
      try {
        const result = await translateToEnglish(text);
        setInputText(result.english_text);
        await runSignPipeline(result.english_text, `${result.original_text}\n${result.english_text}`, result.original_text);
      } catch {
        setError('Translation failed. Please try again.');
      }
      return;
    }
    await runSignPipeline(text, text);
  };

  const handleRecordComplete = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsTranscribing(true);
    setError(null);
    setInputText('');
    resetOutputs();
    try {
      const text = mode === 'hongkong' ? await transcribeCantoneseAudio(audioBlob) : await transcribeAudio(audioBlob);
      setInputText(text);
      setIsTranscribing(false);
      await runTranslation(text);
    } catch {
      setError('Transcription failed. Please try again.');
      setIsTranscribing(false);
    }
  };

  const handleModeChange = (next: AppMode) => {
    setMode(next);
    setInputText('');
    resetOutputs();
    setError(null);
  };

  return (
    <div className="min-h-screen transition-all duration-300">
      <header className="glass border-b border-theme-primary sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">EasySign</h1>
                <p className="text-xs sm:text-sm text-theme-secondary font-medium">Speech and text to sign language — made easy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ModeToggle mode={mode} onChange={handleModeChange} />
              <button onClick={toggleTheme} className="p-3 rounded-xl bg-theme-secondary hover:bg-theme-tertiary transition-all duration-200 shadow-sm" aria-label="Toggle theme">
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-theme-secondary" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-theme-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="xl:col-span-5 h-full">
            <div className="card h-full flex flex-col">
              <div className="pb-4 border-b border-theme-primary">
                <h2 className="text-lg sm:text-xl font-bold text-theme-primary">Input Text</h2>
                <p className="text-sm text-theme-secondary">
                  {mode === 'hongkong' ? 'Type or speak Cantonese' : 'Type or speak your message to translate'}
                </p>
              </div>
              <div className="flex-1 flex flex-col pt-4">
                {isTranscribing ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <div className="w-12 h-12 loading-spinner mx-auto mb-4" />
                      <p className="text-sm text-theme-secondary">Processing voice recording...</p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="input flex-1"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={mode === 'hongkong' ? '輸入廣東話訊息或使用語音錄製...' : 'Type your message here or use voice recording to get started...'}
                  />
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setIsRecording(true)} disabled={isRecording || isTranscribing} className="btn btn-success flex-1">Record Voice</button>
                  <button onClick={() => runTranslation(inputText)} disabled={isTranslating || isTranscribing || !inputText.trim()} className="btn btn-primary flex-1">
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 h-full">
            <div className="card h-full flex flex-col">
              <div className="pb-4 border-b border-theme-primary">
                <h2 className="text-lg font-bold text-theme-primary">SignWriting</h2>
                <p className="text-sm text-theme-secondary">{isGeneratingSigns ? 'Processing...' : `${signWriting.length} sign${signWriting.length !== 1 ? 's' : ''}`}</p>
              </div>
              <div className="flex-1 pt-4 overflow-y-auto">
                {isGeneratingSigns ? (
                  <div className="flex items-center justify-center h-full"><div className="w-10 h-10 loading-spinner" style={{ borderTopColor: 'var(--purple-500)', borderRightColor: 'var(--purple-500)' }} /></div>
                ) : (
                  <SignWritingPanel fswTokens={signWriting} signSize={24} />
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 h-full">
            <div className="card h-full flex flex-col">
              <div className="pb-4 border-b border-theme-primary">
                <h2 className="text-lg sm:text-xl font-bold text-theme-primary">Animation</h2>
                <p className="text-sm text-theme-secondary">Sign language animation</p>
              </div>
              <div className="flex-1 pt-4">
                {isGeneratingAnimation ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 loading-spinner mx-auto mb-4" style={{ borderTopColor: 'var(--indigo-500)', borderRightColor: 'var(--indigo-500)' }} />
                  </div>
                ) : (
                  <PoseViewer poseFile={poseFile ?? undefined} isTranslating={isGeneratingAnimation} />
                )}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="mt-6 bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-800">{error}</div>}

        {mode === 'hongkong' && originalText && englishText && (
          <div className="mt-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800 font-medium mb-2">Transcript</p>
              <p className="text-primary-700 text-sm mb-1">{originalText}</p>
              <p className="text-primary-600 text-sm">{englishText}</p>
            </div>
          </div>
        )}

        {mode === 'english' && transcription && (
          <div className="mt-6 hidden sm:block">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800 font-medium mb-1">Transcript</p>
              <p className="text-primary-700 text-sm">{transcription}</p>
            </div>
          </div>
        )}
      </main>

      {isRecording && <AudioRecorder onRecordingComplete={handleRecordComplete} onClose={() => setIsRecording(false)} />}
    </div>
  );
}

export default App;
