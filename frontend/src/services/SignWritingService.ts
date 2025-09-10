// SignWritingService.ts
// Handles loading fonts and FSW normalization for rendering.
import { cssAppend } from '@sutton-signwriting/font-ttf/font/font.min.mjs';
import { signNormalize, signSvg } from '@sutton-signwriting/font-ttf/fsw/fsw.mjs';

const SignWritingService = {
  fontsLoaded: false,

  async loadFonts() {
    if (this.fontsLoaded) return;
    this.fontsLoaded = true;

    try {
      // Load fonts using the library's method
      cssAppend('/fonts/');
      
      // Wait for fonts to be ready
      await document.fonts.ready;
      
    } catch (error) {
      console.error('Failed to load SignWriting fonts:', error);
      this.fontsLoaded = false;
    }
  },

  async normalizeFSW(fswToken: string | null): Promise<string | null> {
    if (!fswToken) return null;
    
    try {
      const normalized = await signNormalize(fswToken);
      return normalized;
    } catch (error) {
      console.error('Failed to normalize FSW:', error);
      return fswToken; // Return original if normalization fails
    }
  },

  // Convert FSW to SVG for rendering with theme-aware colors
  fswToSvg(fswToken: string, lineColor: string = 'black', fillColor: string = 'white'): string {
    try {
      const svgContent = signSvg(fswToken);
      
      // Replace hardcoded colors with theme colors
      const themedSvg = svgContent
        .replace(/fill="black"/g, `fill="${lineColor}"`)
        .replace(/fill="white"/g, `fill="${fillColor}"`)
        .replace(/class="sym-line" fill="black"/g, `class="sym-line" fill="${lineColor}"`)
        .replace(/class="sym-fill" fill="white"/g, `class="sym-fill" fill="${fillColor}"`);
      
      return themedSvg;
    } catch (error) {
      console.error('Failed to convert FSW to SVG:', error);
      return '';
    }
  },

  // Export SignWriting as SVG file
  async exportAsSvg(fswTokens: string[], filename: string = 'signwriting-export.svg', lineColor: string = 'black', fillColor: string = 'white'): Promise<void> {
    try {
      const normalizedTokens = await Promise.all(
        fswTokens.map(token => this.normalizeFSW(token))
      );
      const validTokens = normalizedTokens.filter(Boolean) as string[];

      if (validTokens.length === 0) {
        throw new Error('No valid SignWriting tokens to export');
      }

      // Create SVG wrapper
      const svgWidth = validTokens.length * 100; // Approximate width per token
      const svgHeight = 120; // Fixed height
      
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
      
      // Add each token as a group
      validTokens.forEach((token, index) => {
        const x = index * 100;
        const tokenSvg = this.fswToSvg(token, lineColor, fillColor);
        // Extract the content inside the <svg> tag
        const contentMatch = tokenSvg.match(/<svg[^>]*>(.*)<\/svg>/s);
        if (contentMatch) {
          svgContent += `<g transform="translate(${x}, 0)">${contentMatch[1]}</g>`;
        }
      });
      
      svgContent += '</svg>';

      // Create and download the file
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export SignWriting as SVG:', error);
      throw error;
    }
  }
};

export default SignWritingService;
