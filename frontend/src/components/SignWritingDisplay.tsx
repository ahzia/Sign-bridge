import React, { useEffect, useState, useRef } from 'react';
import SignWritingService from '../services/SignWritingService';

interface SignWritingDisplayProps {
  fswTokens: string[];
}

const SignWritingDisplay: React.FC<SignWritingDisplayProps> = ({ fswTokens }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [normalizedTokens, setNormalizedTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        setLoading(true);
        await SignWritingService.loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to load SignWriting fonts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    const normalizeTokens = async () => {
      if (!fontsLoaded) return;
      
      const results = [];
      for (const token of fswTokens) {
        const normalized = await SignWritingService.normalizeFSW(token);
        if (normalized) {
          results.push(normalized);
        } else {
          results.push(token);
        }
      }
      setNormalizedTokens(results);
    };
    normalizeTokens();
  }, [fswTokens, fontsLoaded]);

  // Save as Image handler
  const handleSaveAsImage = async () => {
    if (!containerRef.current) return;
    // Get all <fsw-sign> elements
    const fswSigns = Array.from(containerRef.current.querySelectorAll('fsw-sign'));
    if (fswSigns.length === 0) return;
    // Wait a tick to ensure all SVGs are rendered
    await new Promise(r => setTimeout(r, 50));
    // Extract SVGs from shadow DOM of each <fsw-sign>
    let maxWidth = 0;
    let totalHeight = 0;
    const svgData: {svg: SVGSVGElement, width: number, height: number}[] = [];
    for (const el of fswSigns) {
      // @ts-ignore
      const shadow = el.shadowRoot;
      if (!shadow) continue;
      const svg = shadow.querySelector('svg');
      if (!svg) continue;
      const vb = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0,0,100,100];
      const width = vb[2];
      const height = vb[3];
      maxWidth = Math.max(maxWidth, width);
      totalHeight += height;
      svgData.push({svg, width, height});
    }
    // Compose a single SVG string
    let y = 0;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${totalHeight}" viewBox="0 0 ${maxWidth} ${totalHeight}">
` +
      svgData.map(({svg, width, height}) => {
        const svgStr = svg.outerHTML
          .replace('<svg ', `<g transform=\"translate(0,${y})\" `)
          .replace('</svg>', '</g>');
        y += height;
        return svgStr;
      }).join('\n') +
      '\n</svg>';
    // Download as SVG file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signwriting.svg';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-6 h-6 loading-spinner" style={{borderTopColor: 'var(--primary-500)', borderRightColor: 'var(--primary-500)', borderWidth: '2px'}}></div>
          </div>
          <p className="text-sm text-theme-secondary font-medium">
            Loading SignWriting fonts...
          </p>
        </div>
      </div>
    );
  }

  if (!fontsLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full" style={{ background: 'var(--bg-danger)' }}>
            <svg className="w-6 h-6 text-danger-600 dark:text-danger-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-danger-600 font-medium mb-2">
            Font Loading Failed
          </p>
          <p className="text-xs text-theme-muted">
            Please refresh the page to try again
          </p>
        </div>
      </div>
    );
  }

  if (normalizedTokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
            <svg className="w-8 h-8 text-secondary-400 dark:text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm text-theme-secondary font-medium mb-1">
            No Signs to Display
          </p>
          <p className="text-xs text-theme-muted">
            Enter text and translate to see SignWriting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Save as Image Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleSaveAsImage}
          title="Save all as image"
          className="p-2 rounded hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {/* Signs Container */}
      <div className="flex-1">
        <div
          id="signwriting-container"
          ref={containerRef}
          className="flex flex-col items-center space-y-4 p-2"
          style={{
            fontSize: '24px',
            color: 'var(--text-primary)',
          }}
        >
          {normalizedTokens.map((token, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: `<fsw-sign sign="${token}" style="direction: ltr; display: block; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -webkit-touch-callout: none; color: var(--text-primary); fill: var(--text-primary); filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)); transition: transform 0.2s ease-in-out;" class="hover:scale-105 cursor-pointer"></fsw-sign>`
                }}
              />
              
              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-secondary-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Sign {index + 1}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary-900"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SignWritingDisplay;
