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
