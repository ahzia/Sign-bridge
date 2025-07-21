import React from 'react';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  simplifyText: boolean;
  setSimplifyText: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, simplifyText, setSimplifyText }) => (
  <header className="glass border-b border-theme-primary sticky top-0 z-30 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
      <div className="flex flex-row sm:flex-row items-center sm:items-center justify-between sm:justify-between gap-y-0">
        {/* Enhanced Branding */}
        <div className="flex items-center gap-1 sm:gap-4 min-w-0 flex-1">
          <div className="w-7 h-7 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-4 h-4 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[110px] sm:max-w-none">
              SignBridge
            </h1>
            <p className="text-[10px] sm:text-sm text-theme-secondary font-medium truncate max-w-[110px] sm:max-w-none">AI-Powered Voice-to-Sign Translator</p>
          </div>
        </div>
        {/* Enhanced Header Controls */}
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          {/* Simplify Text Toggle - Enhanced */}
          <label className="flex sm:flex items-center gap-1 sm:gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={simplifyText}
                onChange={(e) => setSimplifyText(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-7 h-4 sm:w-11 sm:h-6 rounded-full transition-colors duration-200 flex items-center ${
                simplifyText ? 'bg-primary-500' : 'bg-secondary-300'
              }`}>
                <div className={`w-3 h-3 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  simplifyText ? 'translate-x-3 sm:translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-theme-secondary group-hover:text-primary-600 transition-colors whitespace-nowrap">
                Simplify Text
              </span>
              <span className="hidden sm:inline text-xs text-theme-muted">Optimize for translation</span>
            </div>
          </label>
          {/* Enhanced Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-3 rounded-xl bg-theme-secondary hover:bg-theme-tertiary transition-all duration-200 group shadow-sm hover:shadow-md"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-theme-secondary group-hover:text-purple-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-theme-secondary group-hover:text-warning-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-200"></div>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header; 