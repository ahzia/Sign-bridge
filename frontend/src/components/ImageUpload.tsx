import React, { useRef, useState } from 'react';

interface ImageUploadProps {
  onImageProcessed: (file: File) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageProcessed, 
  onError, 
  disabled = false,
  loading = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      onError('Please select a valid image file (JPEG, JPG, or PNG)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onError('Image file size must be less than 10MB');
      return;
    }

    // Process the file
    onImageProcessed(file);
    
    // Show success indicator briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleClick = () => {
    if (!disabled && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative group ${
        dragActive ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled || loading}
        className={`group relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
          dragActive ? 'ring-2 ring-white ring-opacity-50 scale-105' : ''
        } ${isHovered ? 'scale-105 shadow-lg' : ''} ${
          showSuccess ? 'bg-gradient-to-br from-green-500 to-emerald-600' : ''
        }`}
        aria-label="Upload image for text recognition"
        title="Upload image for OCR"
      >
        {/* Background overlay for hover effect */}
        <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {/* Icon container */}
        <div className="relative flex items-center justify-center">
          {loading ? (
            <div className="w-6 h-6 sm:w-7 sm:h-7 loading-spinner" style={{borderTopColor: 'white', borderRightColor: 'white', borderWidth: '2px'}}></div>
          ) : showSuccess ? (
            <div className="relative">
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          ) : (
            <div className="relative">
              {/* Main icon */}
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              
              {/* Small upload indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-pulse">
                <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {showSuccess ? 'Image processed!' : 'Upload Image for OCR'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Select image file"
      />
      
      {/* Drag and drop overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center pointer-events-none border-2 border-dashed border-purple-400">
          <div className="text-purple-700 font-medium text-xs text-center">
            <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Drop here
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
