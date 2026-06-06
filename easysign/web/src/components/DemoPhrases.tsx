const DEMO_PHRASES = [
  { cantonese: '請在這裡等候', english: 'Please wait here.' },
  { cantonese: '請向左走', english: 'Please go left.' },
  { cantonese: '你需要幫助嗎', english: 'Do you need help?' },
  { cantonese: '請出示身份證', english: 'Please show your ID.' },
  { cantonese: '醫生很快會來', english: 'The doctor will come soon.' },
];

interface DemoPhrasesProps {
  onSelect: (phrase: string) => void;
}

const DemoPhrases = ({ onSelect }: DemoPhrasesProps) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {DEMO_PHRASES.map((phrase) => (
      <button
        key={phrase.cantonese}
        onClick={() => onSelect(phrase.cantonese)}
        className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors dark:bg-purple-900 dark:text-purple-200"
        title={phrase.english}
      >
        {phrase.cantonese}
      </button>
    ))}
  </div>
);

export default DemoPhrases;
