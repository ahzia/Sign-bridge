export type TriagePriority = 'critical' | 'high' | 'medium' | 'low';

export interface HospitalGesture {
  /** MediaPipe GestureRecognizer label */
  mediapipeGesture: string;
  label: string;
  staffMessage: string;
  priority: TriagePriority;
  minScore: number;
  hint: string;
}

/**
 * Hospital gesture pack — maps MediaPipe built-in gestures to clinical meanings.
 * Custom Model Maker gestures can extend this list later.
 */
export const HOSPITAL_GESTURE_PACK: HospitalGesture[] = [
  {
    mediapipeGesture: 'Closed_Fist',
    label: 'Help / Emergency',
    staffMessage: 'Patient may need immediate assistance',
    priority: 'critical',
    minScore: 0.55,
    hint: 'Hold a closed fist steady',
  },
  {
    mediapipeGesture: 'Thumb_Down',
    label: 'No / Getting worse',
    staffMessage: 'Patient indicates refusal or worsening condition',
    priority: 'high',
    minScore: 0.55,
    hint: 'Thumb pointing down',
  },
  {
    mediapipeGesture: 'Pointing_Up',
    label: 'Pain / Attention here',
    staffMessage: 'Patient may be indicating pain or a specific area',
    priority: 'high',
    minScore: 0.55,
    hint: 'Index finger pointing up',
  },
  {
    mediapipeGesture: 'Open_Palm',
    label: 'Stop / Wait',
    staffMessage: 'Patient asks to pause or wait',
    priority: 'medium',
    minScore: 0.55,
    hint: 'Open palm facing camera',
  },
  {
    mediapipeGesture: 'Thumb_Up',
    label: 'Yes / OK',
    staffMessage: 'Patient confirms or feels okay',
    priority: 'low',
    minScore: 0.55,
    hint: 'Thumbs up',
  },
  {
    mediapipeGesture: 'Victory',
    label: 'Two / Peace',
    staffMessage: 'Patient gesture recognized',
    priority: 'low',
    minScore: 0.55,
    hint: 'Index and middle fingers up',
  },
  {
    mediapipeGesture: 'ILoveYou',
    label: 'Thank you',
    staffMessage: 'Patient expressing gratitude',
    priority: 'low',
    minScore: 0.55,
    hint: 'ILY handshape',
  },
];

export function lookupHospitalGesture(
  gestureName: string | null,
  score: number,
): HospitalGesture | null {
  if (!gestureName || gestureName === 'None') return null;
  return (
    HOSPITAL_GESTURE_PACK.find(
      (g) => g.mediapipeGesture === gestureName && score >= g.minScore,
    ) ?? null
  );
}

export const TRIAGE_STYLES: Record<
  TriagePriority,
  { badge: string; banner: string; label: string }
> = {
  critical: {
    badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200',
    banner: 'bg-red-600 text-white',
    label: 'Critical',
  },
  high: {
    badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200',
    banner: 'bg-amber-500 text-white',
    label: 'High',
  },
  medium: {
    badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200',
    banner: 'bg-blue-500 text-white',
    label: 'Medium',
  },
  low: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200',
    banner: 'bg-emerald-600 text-white',
    label: 'Low',
  },
};
