import { generatePose, translateSignWriting, translateToEnglish } from '../api/client';

export interface SignPipelineResult {
  english: string;
  cantonese?: string;
  signWriting: string[];
  poseFile: Blob | null;
}

export async function runEnglishSignPipeline(english: string): Promise<SignPipelineResult> {
  const signWriting = await translateSignWriting(english);
  const poseFile = signWriting.length > 0 ? await generatePose(english) : null;
  return { english, signWriting, poseFile };
}

export async function runCantoneseSignPipeline(cantonese: string): Promise<SignPipelineResult> {
  const { english_text, original_text } = await translateToEnglish(cantonese);
  const result = await runEnglishSignPipeline(english_text);
  return { ...result, cantonese: original_text };
}

export function speakText(text: string, lang = 'en-US'): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}
