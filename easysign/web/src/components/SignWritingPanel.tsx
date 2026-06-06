import { useEffect, useRef, useState } from 'react';
import signWriting from '../services/signWriting';

interface SignWritingPanelProps {
  fswTokens: string[];
  direction?: 'row' | 'col';
  className?: string;
  signSize?: number;
}

const SignWritingPanel = ({ fswTokens, direction = 'col', className, signSize = 48 }: SignWritingPanelProps) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [normalizedTokens, setNormalizedTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    signWriting.loadFonts().then(() => setFontsLoaded(true)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    const normalize = async () => {
      const results: string[] = [];
      for (const token of fswTokens) {
        const normalized = await signWriting.normalizeFSW(token);
        results.push(normalized ?? token);
      }
      setNormalizedTokens(results);
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
        <div className="w-6 h-6 loading-spinner" />
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
        className={`flex flex-${direction} items-center ${direction === 'col' ? 'space-y-4' : 'space-x-4'} p-2 ${className ?? ''}`}
        style={{ fontSize: `${signSize}px`, color: 'var(--text-primary)' }}
      >
        {normalizedTokens.map((token, index) => (
          <div key={index} className="group relative">
            <div
              dangerouslySetInnerHTML={{
                __html: `<fsw-sign sign="${token}" style="direction: ltr; display: block; color: var(--text-primary);"></fsw-sign>`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignWritingPanel;
