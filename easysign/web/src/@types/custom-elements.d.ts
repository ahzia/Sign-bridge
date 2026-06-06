import type React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'fsw-sign': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        sign: string;
        styling?: string;
      };
      'pose-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean | string;
        'aspect-ratio'?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

export {};
