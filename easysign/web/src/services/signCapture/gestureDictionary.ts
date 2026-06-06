export interface GestureEntry {
  english: string;
  fsw?: string;
  hint: string;
}

/** MediaPipe built-in gesture labels → English + optional SignWriting */
export const GESTURE_MAP: Record<string, GestureEntry> = {
  Thumb_Up: {
    english: 'Yes / Thumbs up',
    hint: 'Thumb pointing up',
  },
  Thumb_Down: {
    english: 'No / Thumbs down',
    hint: 'Thumb pointing down',
  },
  Victory: {
    english: 'V / Peace',
    hint: 'Index and middle fingers up',
  },
  Open_Palm: {
    english: 'Hello / Stop',
    fsw: 'M500x500S10040490x490',
    hint: 'Open hand, fingers spread',
  },
  Closed_Fist: {
    english: 'A / Closed fist',
    fsw: 'M500x500S20500490x490S2f800490x490',
    hint: 'Closed fist',
  },
  Pointing_Up: {
    english: 'One / Pointing up',
    hint: 'Index finger pointing up',
  },
  ILoveYou: {
    english: 'I love you',
    hint: 'ASL ILY sign — thumb, index, and pinky up',
  },
};

export const SUPPORTED_GESTURES = Object.keys(GESTURE_MAP);

const MIN_SCORE = 0.6;

export function lookupGesture(
  gestureName: string | null,
  score: number,
): GestureEntry | null {
  if (!gestureName || gestureName === 'None' || score < MIN_SCORE) return null;
  return GESTURE_MAP[gestureName] ?? null;
}

export function formatGestureLabel(gestureName: string | null, score: number): string {
  const entry = lookupGesture(gestureName, score);
  if (entry) return entry.english;
  if (gestureName && gestureName !== 'None') {
    return gestureName.replace(/_/g, ' ');
  }
  return '';
}
