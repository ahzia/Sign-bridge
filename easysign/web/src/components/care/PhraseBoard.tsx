import { useMemo, useState } from 'react';
import {
  CLINICAL_PHRASES,
  PHRASE_CATEGORIES,
  type ClinicalPhrase,
  type PhraseCategory,
} from '../../data/clinicalPhrases';

interface PhraseBoardProps {
  onSelect: (phrase: ClinicalPhrase) => void;
  activeId?: string | null;
  compact?: boolean;
}

const PhraseBoard = ({ onSelect, activeId, compact = false }: PhraseBoardProps) => {
  const [category, setCategory] = useState<PhraseCategory | 'all'>('all');

  const phrases = useMemo(
    () =>
      category === 'all'
        ? CLINICAL_PHRASES
        : CLINICAL_PHRASES.filter((p) => p.category === category),
    [category],
  );

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory('all')}
          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            category === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-theme-secondary text-theme-secondary hover:text-theme-primary'
          }`}
        >
          All
        </button>
        {PHRASE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              category === c.id
                ? 'bg-teal-600 text-white'
                : 'bg-theme-secondary text-theme-secondary hover:text-theme-primary'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className={`flex-1 overflow-y-auto grid gap-2 ${
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
        }`}
      >
        {phrases.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => onSelect(phrase)}
            className={`text-left rounded-xl border p-3 transition-all hover:shadow-md hover:border-teal-400 ${
              activeId === phrase.id
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 ring-2 ring-teal-400'
                : 'border-theme-primary bg-theme-secondary/30'
            }`}
          >
            <p className={`font-medium text-theme-primary ${compact ? 'text-sm' : 'text-base'}`}>
              {phrase.english}
            </p>
            <p className="text-xs text-theme-muted mt-1 line-clamp-2">{phrase.cantonese}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PhraseBoard;
