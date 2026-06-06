import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-theme-page">
      <header className="glass border-b border-theme-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">EasySign</h1>
            <p className="text-sm text-theme-secondary">Speech and text to sign language — made easy</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-theme-secondary hover:bg-theme-tertiary transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
