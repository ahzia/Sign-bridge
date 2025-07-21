declare module '@sutton-signwriting/core' {
  export namespace fsw {
    export function fsw2swu(fsw: string): string;
    export function svg(fsw: string): string;
  }
}
