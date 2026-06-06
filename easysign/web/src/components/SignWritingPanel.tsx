import { useEffect, useRef, useState } from 'react';
import signWriting from '../services/signWriting';

interface SignWritingPanelProps {
  fswTokens: string[];
  direction?: 'row' | 'col';
  className?: string;
  signSize?: number;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SignWritingPanel = ({ fswTokens, direction = 'col', className, signSize = 48 }: SignWritingPanelProps) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [normalizedTokens, setNormalizedTokens] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        setLoading(true);
        await signWriting.loadFonts();
        setFontsLoaded(true);
      } catch {
        setFontsLoaded(false);
      } finally {
        setLoading(false);
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    const normalize = async () => {
      const results = await Promise.all(
        fswTokens.map(async (token) => (await signWriting.normalizeFSW(token)) ?? token),
      );
      setNormalizedTokens(results.filter(Boolean));
    };
    normalize();
  }, [fswTokens, fontsLoaded]);

  const handleSaveAsImage = async () => {
    if (!containerRef.current) return;
    const fswSigns = Array.from(containerRef.current.querySelectorAll('fsw-sign'));
    if (fswSigns.length === 0) return;
    await new Promise((r) => setTimeout(r, 50));

    let maxWidth = 0;
    let totalHeight = 0;
    const svgData: { svg: SVGSVGElement; height: number }[] = [];

    for (const el of fswSigns) {
      const shadow = (el as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
      const svg = shadow?.querySelector('svg');
      if (!svg) continue;
      const vb = svg.getAttribute('viewBox')?.split(' ').map(Number) ?? [0, 0, 100, 100];
      maxWidth = Math.max(maxWidth, vb[2]);
      totalHeight += vb[3];
      svgData.push({ svg, height: vb[3] });
    }

    let y = 0;
    const svgContent =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${totalHeight}" viewBox="0 0 ${maxWidth} ${totalHeight}">` +
      svgData
        .map(({ svg, height }) => {
          const svgStr = svg.outerHTML.replace('<svg ', `<g transform="translate(0,${y})" `).replace('</svg>', '</g>');
          y += height;
          return svgStr;
        })
        .join('\n') +
      '</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signwriting.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 loading-spinner mx-auto mb-3" />
          <p className="text-sm text-theme-secondary">Loading SignWriting fonts...</p>
        </div>
      </div>
    );
  }

  if (!fontsLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-sm text-danger-600">Font loading failed. Please refresh the page.</p>
      </div>
    );
  }

  if (normalizedTokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-sm text-theme-secondary font-medium">No signs to display</p>
        <p className="text-xs text-theme-muted">Enter text and translate to see SignWriting</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-2">
        <button onClick={handleSaveAsImage} title="Save as SVG" className="p-2 rounded hover:bg-primary-100 transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div
        ref={containerRef}
        id="signwriting-container"
        className={`flex flex-${direction} items-center justify-center min-h-[120px] ${direction === 'col' ? 'space-y-4' : 'space-x-4'} p-2 ${className ?? ''}`}
        style={{ fontSize: `${signSize}px`, color: 'var(--text-primary)' }}
      >
        {normalizedTokens.map((token, index) => (
          <div key={`${token}-${index}`} className="group relative">
            <div
              dangerouslySetInnerHTML={{
                __html: `<fsw-sign sign="${escapeHtml(token)}" style="direction: ltr; display: block; font-size: ${signSize}px; color: var(--text-primary); fill: var(--text-primary); filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));"></fsw-sign>`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignWritingPanel;
