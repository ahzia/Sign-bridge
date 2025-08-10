import React from 'react';

interface SimplifyChoiceModalProps {
  original: string;
  simplified: string;
  onSelect: (choice: 'original' | 'simplified') => void;
  onClose: () => void;
}

const SimplifyChoiceModal: React.FC<SimplifyChoiceModalProps> = ({ original, simplified, onSelect, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white dark:bg-theme-modal rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
      <button onClick={onClose} className="absolute top-3 right-3 text-theme-secondary hover:text-theme-primary">✕</button>
      <h2 className="text-lg font-bold mb-4">Choose Text for Translation</h2>
      <div className="mb-4">
        <div className="mb-2 font-semibold">Original:</div>
        <div className="p-2 bg-theme-secondary rounded mb-4 whitespace-pre-wrap">{original}</div>
        <div className="mb-2 font-semibold">Simplified:</div>
        <div className="p-2 bg-primary-50 dark:bg-primary-900 dark:text-white rounded whitespace-pre-wrap">{simplified}</div>
      </div>
      <div className="text-xs font-bold mb-4" style={{ color: 'var(--success-600, #16a34a)' }}>
        This simplification is powered by <span style={{ color: 'var(--danger-600, #dc2626)' }}>Grok</span> and <span style={{ color: 'var(--danger-600, #dc2626)' }}>Llama AI</span> models.
      </div>
      <div className="flex gap-4 justify-end mt-6">
        <button
          onClick={() => onSelect('original')}
          className="px-4 py-2 rounded bg-secondary-200 hover:bg-secondary-300 text-theme-primary font-semibold dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-white"
        >
          Use Original
        </button>
        <button onClick={() => onSelect('simplified')} className="px-4 py-2 rounded bg-primary-500 hover:bg-primary-600 text-white font-semibold">Use Simplified</button>
      </div>
    </div>
  </div>
);

export default SimplifyChoiceModal; 