import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pose-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        'aspect-ratio'?: string;
      };
    }
  }
} 