const signWriting = {
  fontModulePromise: null as Promise<typeof import('@sutton-signwriting/font-ttf/font/font.min')> | null,
  fontsLoaded: false,

  getFontModule() {
    if (!this.fontModulePromise) {
      this.fontModulePromise = import('@sutton-signwriting/font-ttf/font/font.min');
    }
    return this.fontModulePromise;
  },

  async loadFonts() {
    if (this.fontsLoaded) return;
    this.fontsLoaded = true;
    const fontModule = await this.getFontModule();
    fontModule.cssAppend('/fonts/');
    return new Promise<void>((resolve) => fontModule.cssLoaded(resolve));
  },

  async normalizeFSW(fswToken: string | null) {
    if (!fswToken) return null;
    const { signNormalize } = await import('@sutton-signwriting/font-ttf/fsw/fsw');
    return signNormalize(fswToken);
  },
};

export default signWriting;
