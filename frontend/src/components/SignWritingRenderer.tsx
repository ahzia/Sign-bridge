import React, { useState, useEffect } from 'react';
import SignWritingService from '../services/SignWritingService';
import { useTheme } from '../contexts/ThemeContext';

interface SignWritingRendererProps {
  fswTokens: string[];
  direction?: 'row' | 'col';
  className?: string;
  signSize?: number;
}

const SignWritingRenderer: React.FC<SignWritingRendererProps> = ({ 
  fswTokens, 
  direction = 'row',
  className = '',
  signSize = 30
}) => {
  const [normalizedTokens, setNormalizedTokens] = useState<string[]>([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Theme-aware colors
  const lineColor = theme === 'dark' ? '#ffffff' : '#000000';
  const fillColor = theme === 'dark' ? '#1f2937' : '#ffffff';

  useEffect(() => {
    const initializeFonts = async () => {
      await SignWritingService.loadFonts();
      setFontsLoaded(true);
    };

    initializeFonts();
  }, []);

  useEffect(() => {
    const processTokens = async () => {
      if (!fswTokens || fswTokens.length === 0) {
        setNormalizedTokens([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await Promise.all(
          fswTokens.map(token => SignWritingService.normalizeFSW(token))
        );
        const filteredResults = results.filter(Boolean) as string[];
        setNormalizedTokens(filteredResults);
      } catch (error) {
        console.error('Error processing FSW tokens:', error);
        setNormalizedTokens([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (fontsLoaded) {
      processTokens();
    }
  }, [fswTokens, fontsLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading SignWriting...</span>
      </div>
    );
  }

  if (!normalizedTokens.length) {
    return (
      <div className="flex items-center justify-center p-4 text-gray-500">
        <span>No SignWriting to display</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 justify-center items-center p-4 ${direction === 'col' ? 'flex-col' : 'flex-wrap'} ${className}`}>
      {normalizedTokens.map((token: string, index: number) => (
        <div
          key={index}
          className="hover:scale-105 cursor-pointer"
          style={{
            direction: 'ltr',
            display: 'block',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
            color: 'var(--text-primary)',
            fill: 'var(--text-primary)',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
            transition: 'transform 0.2s ease-in-out',
            fontSize: `${signSize}px`,
          }}
          dangerouslySetInnerHTML={{
            __html: SignWritingService.fswToSvg(token, lineColor, fillColor)
          }}
        />
      ))}
    </div>
  );
};

export default SignWritingRenderer; 