import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();

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
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  EasySign
                </h1>
                <p className="text-xs sm:text-sm text-theme-secondary font-medium">Speech and text to sign language — made easy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 bg-theme-secondary rounded-lg p-1">
                <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-primary-500 text-white">English</button>
                <button className="px-3 py-1.5 text-xs font-semibold rounded-md text-theme-secondary">Hong Kong</button>
              </div>

              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-theme-secondary hover:bg-theme-tertiary transition-all duration-200 shadow-sm"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-theme-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-theme-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
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
                <h2 className="text-lg font-bold text-theme-primary">Input</h2>
                <p className="text-sm text-theme-secondary">Type or speak your message</p>
              </div>
              <div className="flex-1 flex items-center justify-center text-theme-muted text-sm">
                Input panel
              </div>
            </div>
          </div>

          <div className="xl:col-span-3 h-full">
            <div className="card h-full flex flex-col">
              <div className="pb-4 border-b border-theme-primary">
                <h2 className="text-lg font-bold text-theme-primary">SignWriting</h2>
                <p className="text-sm text-theme-secondary">Visual notation system</p>
              </div>
              <div className="flex-1 flex items-center justify-center text-theme-muted text-sm">
                SignWriting panel
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 h-full">
            <div className="card h-full flex flex-col">
              <div className="pb-4 border-b border-theme-primary">
                <h2 className="text-lg font-bold text-theme-primary">Animation</h2>
                <p className="text-sm text-theme-secondary">Sign language animation</p>
              </div>
              <div className="flex-1 flex items-center justify-center text-theme-muted text-sm">
                Animation panel
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
