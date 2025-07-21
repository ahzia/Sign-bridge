declare namespace JSX {
  interface IntrinsicElements {
    'pose-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      src?: string;
      autoplay?: boolean | string;
      'aspect-ratio'?: string;
      style?: React.CSSProperties;
    };
  }
} 