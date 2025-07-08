import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Translating...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && (
        <div className="text-center">
          <p className="text-sm font-medium text-theme-secondary mb-2">
            {text}
          </p>
          <div className="loading-dots">
            <div style={{ '--i': 0 } as React.CSSProperties}></div>
            <div style={{ '--i': 1 } as React.CSSProperties}></div>
            <div style={{ '--i': 2 } as React.CSSProperties}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 