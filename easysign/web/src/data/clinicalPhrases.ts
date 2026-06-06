export type PhraseCategory = 'greeting' | 'instruction' | 'question' | 'reassurance' | 'discharge';

export interface ClinicalPhrase {
  id: string;
  english: string;
  cantonese: string;
  category: PhraseCategory;
}

export const PHRASE_CATEGORIES: { id: PhraseCategory; label: string }[] = [
  { id: 'greeting', label: 'Greeting' },
  { id: 'instruction', label: 'Instructions' },
  { id: 'question', label: 'Questions' },
  { id: 'reassurance', label: 'Reassurance' },
  { id: 'discharge', label: 'Discharge' },
];

/** Phrases staff say TO patients — English drives the sign pipeline */
export const CLINICAL_PHRASES: ClinicalPhrase[] = [
  { id: 'hello', english: 'Hello, I am your nurse today.', cantonese: '你好，我今日係你嘅護士。', category: 'greeting' },
  { id: 'name', english: 'My name is Alex. I will be helping you today.', cantonese: '我叫做 Alex，今日由我嚟幫你。', category: 'greeting' },
  { id: 'deaf', english: 'I know you use sign language. I will show you signs on the screen.', cantonese: '我知道你用手語，我會喺螢幕上顯示手語。', category: 'greeting' },
  { id: 'wait', english: 'Please wait here.', cantonese: '請在這裡等候。', category: 'instruction' },
  { id: 'sit', english: 'Please sit down.', cantonese: '請坐下。', category: 'instruction' },
  { id: 'id', english: 'Please show your ID card.', cantonese: '請出示身份證。', category: 'instruction' },
  { id: 'left', english: 'Please go to the left.', cantonese: '請向左走。', category: 'instruction' },
  { id: 'right', english: 'Please go to the right.', cantonese: '請向右走。', category: 'instruction' },
  { id: 'medicine', english: 'Please take this medicine.', cantonese: '請服用這種藥物。', category: 'instruction' },
  { id: 'water', english: 'You can have some water.', cantonese: '你可以飲水。', category: 'instruction' },
  { id: 'pain', english: 'Do you have any pain?', cantonese: '你有冇痛？', category: 'question' },
  { id: 'help', english: 'Do you need help?', cantonese: '你需要幫助嗎？', category: 'question' },
  { id: 'allergy', english: 'Do you have any allergies?', cantonese: '你有冇藥物過敏？', category: 'question' },
  { id: 'understand', english: 'Do you understand?', cantonese: '你明唔明白？', category: 'question' },
  { id: 'doctor-soon', english: 'The doctor will come soon.', cantonese: '醫生很快會來。', category: 'reassurance' },
  { id: 'safe', english: 'You are safe. We are here to help you.', cantonese: '你很安全，我哋會幫你。', category: 'reassurance' },
  { id: 'test', english: 'We need to do a test. It will only take a few minutes.', cantonese: '我哋需要做一個檢查，只係幾分鐘。', category: 'reassurance' },
  { id: 'interpreter', english: 'I will arrange a sign language interpreter for you.', cantonese: '我會為你安排手語傳譯員。', category: 'reassurance' },
  { id: 'home', english: 'You can go home now.', cantonese: '你而家可以回家。', category: 'discharge' },
  { id: 'followup', english: 'Please come back for your follow-up appointment.', cantonese: '請返嚟覆診。', category: 'discharge' },
  { id: 'call', english: 'Call us if you feel worse.', cantonese: '如果情況變差，請致電我們。', category: 'discharge' },
];
