const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

export async function transcribeAudio(blob: Blob): Promise<string> {
  const form = new FormData();
  form.append('audio', blob, 'recording.webm');
  const res = await fetch(`${API_BASE}/transcribe`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Transcription failed');
  const data = await res.json();
  return data.text ?? '';
}

export async function translateSignWriting(text: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/translate_signwriting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('SignWriting translation failed');
  const data = await res.json();
  const raw = data.signwriting ?? '';
  return raw.trim().split(/\s+/).filter((t: string) => t.length > 0);
}

export async function generatePose(text: string): Promise<Blob | null> {
  const res = await fetch(`${API_BASE}/generate_pose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, spoken_language: 'en', signed_language: 'ase' }),
  });
  if (!res.ok) return null;
  const { pose_data, data_format } = await res.json();
  if (data_format !== 'binary_base64' || !pose_data) return null;
  const binary = atob(pose_data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: 'application/octet-stream' });
}
