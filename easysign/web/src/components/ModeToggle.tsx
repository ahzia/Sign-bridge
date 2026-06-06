export type AppMode = 'english' | 'hongkong';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const ModeToggle = ({ mode, onChange }: ModeToggleProps) => (
  <div className="flex items-center gap-1 bg-theme-secondary rounded-lg p-1">
    <button
      onClick={() => onChange('english')}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        mode === 'english' ? 'bg-primary-500 text-white' : 'text-theme-secondary hover:text-theme-primary'
      }`}
    >
      English
    </button>
    <button
      onClick={() => onChange('hongkong')}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        mode === 'hongkong' ? 'bg-primary-500 text-white' : 'text-theme-secondary hover:text-theme-primary'
      }`}
    >
      Cantonese
    </button>
  </div>
);

export default ModeToggle;
