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
  }
};

export default SignWritingService;
