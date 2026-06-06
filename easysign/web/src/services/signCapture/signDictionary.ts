export interface SignDictionaryEntry {
  /** Human-readable label shown as the English result */
  english: string;
  /** Optional SignWriting (FSW) token for the SignWriting panel */
  fsw?: string;
  /** Shape indices from the hand-shape model (±tolerance matched in lookup) */
  shapeIndices: number[];
  hint: string;
}

/**
 * Demo dictionary — map hand-shape model indices to English labels.
 * Indices vary slightly by camera and signer; each entry matches index ±2.
 * Expand by noting the "shape #" shown when you hold a sign steady.
 */
export const DEMO_SIGN_DICTIONARY: SignDictionaryEntry[] = [
  {
    english: 'A (fist, thumb beside)',
    shapeIndices: [0, 1, 2, 3, 4],
    fsw: 'M500x500S20500490x490S2f800490x490',
    hint: 'Closed fist, thumb resting alongside the index finger',
  },
  {
    english: 'B (flat hand)',
    shapeIndices: [5, 6, 7, 8, 9, 10],
    fsw: 'M500x500S10040490x490',
    hint: 'Fingers extended and together, thumb across palm',
  },
  {
    english: 'C (curved hand)',
    shapeIndices: [11, 12, 13, 14],
    hint: 'Hand curved as if holding a small cup',
  },
  {
    english: 'L',
    shapeIndices: [20, 21, 22, 23],
    hint: 'Index finger and thumb extended in an L shape',
  },
  {
    english: 'V (peace)',
    shapeIndices: [30, 31, 32, 33],
    hint: 'Index and middle fingers up in a V',
  },
  {
    english: 'W',
    shapeIndices: [40, 41, 42, 43],
    hint: 'Three fingers up (index, middle, ring)',
  },
  {
    english: 'Yes / thumbs up',
    shapeIndices: [50, 51, 52],
    hint: 'Thumb pointing upward',
  },
  {
    english: 'Open hand',
    shapeIndices: [60, 61, 62, 63, 64],
    hint: 'All fingers spread open',
  },
  {
    english: 'Thank you',
    shapeIndices: [70, 71, 72],
    fsw: 'M500x500S14c20489x524S27106515x543S30a00482x482',
    hint: 'Flat hand starting at chin, moving forward (hold still for demo)',
  },
];

const TOLERANCE = 2;

export function lookupShapeIndex(shapeIndex: number): SignDictionaryEntry | null {
  for (const entry of DEMO_SIGN_DICTIONARY) {
    if (entry.shapeIndices.some((i) => Math.abs(i - shapeIndex) <= TOLERANCE)) {
      return entry;
    }
  }
  return null;
}

export function fallbackLabel(shapeIndex: number): string {
  return `Handshape #${shapeIndex}`;
}
