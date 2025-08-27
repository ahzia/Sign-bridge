import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

interface ModelStatus {
  initialized: boolean;
  initializing: boolean;
  model_loaded: boolean;
}

interface ModelInitializationStatusProps {
  onInitializationComplete?: () => void;
  showOnlyWhenInitializing?: boolean;
}

const ModelInitializationStatus: React.FC<ModelInitializationStatusProps> = ({ 
  onInitializationComplete,
  showOnlyWhenInitializing = false 
}) => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const triggerInitialization = async () => {
    try {
      setError(null);
      console.log('🔧 Triggering model initialization...');
      
      const response = await ApiService.post('/initialize-model', {});
      console.log('Initialization response:', response);
      
      if (response.status === 'success') {
        console.log('✅ Model initialization triggered successfully');
        // Check status again after a short delay
        setTimeout(checkModelStatus, 1000);
      } else if (response.status === 'already_initialized') {
        console.log('✅ Model already initialized');
        checkModelStatus();
      } else {
        setError(response.message || 'Failed to initialize model');
      }
    } catch (err) {
      setError('Failed to trigger model initialization');
      console.error('Error triggering initialization:', err);
    }
  };

  const checkModelStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiService.get('/features');
      const whisperStatus = response.whisper_model;
      
      if (whisperStatus && !whisperStatus.error) {
        setModelStatus(whisperStatus);
        
        // If model is not initialized and not currently initializing, trigger initialization
        if (!whisperStatus.initialized && !whisperStatus.initializing) {
          console.log('🔧 Model not initialized, triggering initialization...');
          triggerInitialization();
        }
        
        // Call completion callback if model is initialized
        if (whisperStatus.initialized && onInitializationComplete) {
          onInitializationComplete();
        }
      } else {
        setError('Could not check model status');
      }
    } catch (err) {
      setError('Failed to check model status');
      console.error('Error checking model status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkModelStatus();
    
    // Poll for status updates if model is initializing
    const interval = setInterval(() => {
      if (modelStatus?.initializing) {
        checkModelStatus();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [modelStatus?.initializing]);

  // Don't show anything if we only want to show during initialization and it's not initializing
  if (showOnlyWhenInitializing && !modelStatus?.initializing) {
    return null;
  }

  // Don't show anything if model is not available
  if (!modelStatus && !isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          {modelStatus?.initializing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          ) : modelStatus?.initialized ? (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {modelStatus?.initializing ? 'Initializing AI Model...' : 
             modelStatus?.initialized ? 'AI Model Ready' : 
             'Checking AI Model...'}
          </h3>
        </div>

        <div className="space-y-3">
          {modelStatus?.initializing && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Setting up speech recognition model for the first time...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This may take a few moments. You can continue using the app while this happens.
              </p>
            </div>
          )}

          {modelStatus?.initialized && (
            <div className="space-y-2">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ Speech recognition model is ready!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                You can now record audio for transcription.
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ {error}
              </p>
              <button
                onClick={checkModelStatus}
                className="text-xs text-primary-500 hover:text-primary-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          {isLoading && !modelStatus && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Checking model status...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '30%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Show Continue button when model is initialized OR when we have a status (even if initializing) */}
        {(modelStatus?.initialized || modelStatus) && (
          <div className="mt-4 space-y-2">
            <button
              onClick={() => onInitializationComplete?.()}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {modelStatus?.initialized ? 'Continue' : 'Continue (Model Initializing in Background)'}
            </button>
            
            {modelStatus?.initializing && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                You can start using the app now. The AI model will be ready shortly.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelInitializationStatus;
