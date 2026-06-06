const signWriting = {
  fontsLoaded: true,

  async loadFonts(): Promise<void> {
    return Promise.resolve();
  },

  async normalizeFSW(fswToken: string | null): Promise<string | null> {
    if (!fswToken || typeof fswToken !== 'string') return null;
    try {
      const { signNormalize } = await import('@sutton-signwriting/font-ttf/fsw/fsw');
      return signNormalize(fswToken.trim());
    } catch {
      return fswToken.trim() || null;
    }
  },
};

export default signWriting;
