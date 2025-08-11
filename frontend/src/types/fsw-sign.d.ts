import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'fsw-sign': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        sign: string;
        styling?: string;
      };
    }
  }
}
