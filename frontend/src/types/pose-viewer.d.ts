import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pose-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        'aspect-ratio'?: string;
        width?: string | number;
        height?: string | number;
        style?: React.CSSProperties;
        className?: string;
        // Add any other properties that pose-viewer might use
        currentTime?: number;
        duration?: number;
        paused?: boolean;
        ended?: boolean;
        readyState?: number;
        error?: any;
        syncMedia?: boolean;
        getPose?: () => any;
        nextFrame?: () => void;
        play?: () => void;
        pause?: () => void;
      };
    }
  }
} 