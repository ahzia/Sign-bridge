import { useEffect, useRef, useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import SignWritingPanel from './components/SignWritingPanel';
import { transcribeAudio, translateSignWriting } from './api/client';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [inputText, setInputText] = useState('');
  const [signWriting, setSignWriting] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSigns, setIsGeneratingSigns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (translationTimeout.current) clearTimeout(translationTimeout.current);
    if (inputText.trim() === '') {
      setSignWriting([]);
      return;
    }
    translationTimeout.current = setTimeout(() => {
      if (/[.!?\n]$/.test(inputText.trim())) {
        runTranslation(inputText);
      }
    }, 1500);
  }, [inputText]);

  const runTranslation = async (text: string) => {
    setIsTranslating(true);
    setIsGeneratingSigns(true);
    setError(null);
    setSignWriting([]);
    try {
      const tokens = await translateSignWriting(text);
      setSignWriting(tokens);
    } catch {
      setError('Translation failed. Please try again.');
      setSignWriting([]);
    } finally {
      setIsTranslating(false);
      setIsGeneratingSigns(false);
    }
  };

  const handleRecordComplete = async (audioBlob: Blob) => {
    setIsRecording(false);
    setIsTranscribing(true);
    setError(null);
    try {
      const text = await transcribeAudio(audioBlob);
      setInputText(text);
      runTranslation(text);
    } catch {
      setError('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300">
      <header className="glass border-b border-theme-primary sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">EasySign</h1>
            <p className="text-xs sm:text-sm text-theme-secondary">Speech and text to sign language — made easy</p>
          </div>
          <button onClick={toggleTheme} className="p-3 rounded-xl bg-theme-secondary hover:bg-theme-tertiary transition-colors" aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="xl:col-span-5 h-full">
            <div className="card h-full flex flex-col">
              <div className="pb-4 border-b border-theme-primary">
                <h2 className="text-lg font-bold text-theme-primary">Input</h2>
                <p className="text-sm text-theme-secondary">Type or speak your message</p>
              </div>
              <div className="flex-1 flex flex-col pt-4">
                {isTranscribing ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 loading-spinner mx-auto mb-4" />
                    <p className="text-sm text-theme-secondary">Converting speech to text...</p>
                  </div>
                ) : (
                  <textarea
                    className="input flex-1"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message here or use voice recording..."
                  />
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setIsRecording(true)} disabled={isRecording || isTranscribing} className="btn btn-success flex-1">
                    Record Voice
                  </button>
                  <button
                    onClick={() => runTranslation(inputText)}
                    disabled={isTranslating || isTranscribing || !inputText.trim()}
                    className="btn btn-primary flex-1"
                  >
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
                <p className="text-sm text-theme-secondary">{isGeneratingSigns ? 'Processing...' : `${signWriting.length} signs`}</p>
              </div>
              <div className="flex-1 pt-4 overflow-y-auto">
                {isGeneratingSigns ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-10 h-10 loading-spinner" />
                  </div>
                ) : (
                  <SignWritingPanel fswTokens={signWriting} signSize={24} />
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 h-full">
            <div className="card h-full flex items-center justify-center text-theme-muted text-sm">Animation panel</div>
          </div>
        </div>

        {error && <div className="mt-6 bg-danger-50 border border-danger-200 rounded-lg p-4 text-danger-800">{error}</div>}
      </main>

      {isRecording && <AudioRecorder onRecordingComplete={handleRecordComplete} onClose={() => setIsRecording(false)} />}
    </div>
  );
}

export default App;
