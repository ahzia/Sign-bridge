declare module '@sutton-signwriting/font-ttf/font/font.min.mjs' {
  export function cssAppend(path: string): void;
}

declare module '@sutton-signwriting/font-ttf/fsw/fsw.min.mjs' {
  export function signNormalize(fswToken: string): Promise<string>;
  export function P(fswToken: string): string; // signSvg function
}

declare module '@sutton-signwriting/font-ttf/fsw/fsw.mjs' {
  export function signNormalize(fswToken: string): Promise<string>;
  export function signSvg(fswToken: string): string;
} 