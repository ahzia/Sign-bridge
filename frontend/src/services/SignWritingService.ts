// SignWritingService.ts
// Handles loading fonts and normalizing FSW strings for drawing on a static canvas.
import * as fontModule from '@sutton-signwriting/font-ttf/font/font.min';
import { signNormalize } from '@sutton-signwriting/font-ttf/fsw/fsw';

const SignWritingService = {
  fontsLoaded: false,

  async loadFonts() {
    if (this.fontsLoaded) return;
    this.fontsLoaded = true;

    try {
      fontModule.cssAppend('/fonts/');
      return new Promise<void>(resolve => fontModule.cssLoaded(resolve));
    } catch (e) {
      console.error('Failed to load SignWriting fonts:', e);
      return Promise.reject(e);
    }
  },

  async normalizeFSW(fswToken: string | null) {
    if (!fswToken || typeof fswToken !== 'string') return null;
    try {
      return signNormalize(fswToken);
    } catch (e) {
      console.error(`Failed to normalize FSW token for canvas: "${fswToken}"`, e);
      return null;
    }
  }
};

export default SignWritingService;
