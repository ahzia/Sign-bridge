import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface BackendStatus {
  isRunning: boolean;
  features: any;
  error?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onToggle }) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    isRunning: false,
    features: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkBackendStatus = async () => {
    setIsLoading(true);
    try {
      const features = await ApiService.get('/features');
      setBackendStatus({
        isRunning: true,
        features
      });
    } catch (error) {
      setBackendStatus({
        isRunning: false,
        features: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      checkBackendStatus();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">🐛 Debug Panel</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Backend Status */}
        <div>
          <h4 className="font-semibold mb-2">Backend Status</h4>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${backendStatus.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{backendStatus.isRunning ? 'Running' : 'Not Running'}</span>
            {isLoading && <span className="text-yellow-400">Checking...</span>}
          </div>
          {backendStatus.error && (
            <div className="text-red-400 text-sm mt-1">
              Error: {backendStatus.error}
            </div>
          )}
        </div>

        {/* Features Status */}
        {backendStatus.isRunning && backendStatus.features && (
          <div>
            <h4 className="font-semibold mb-2">Features</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(backendStatus.features).map(([feature, available]) => (
                <div key={feature} className="flex justify-between">
                  <span>{feature}:</span>
                  <span className={available ? 'text-green-400' : 'text-red-400'}>
                    {available ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-gray-700">
          <button
            onClick={checkBackendStatus}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm"
          >
            {isLoading ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        {/* Environment Info */}
        <div className="pt-2 border-t border-gray-700">
          <h4 className="font-semibold mb-2">Environment</h4>
          <div className="text-sm space-y-1">
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
            <div>Prod: {import.meta.env.PROD ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;



