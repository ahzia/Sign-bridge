import type { TriagePriority } from '../data/hospitalGestures';

export type VisitRole = 'staff' | 'patient';

export interface HospitalGesturePayload {
  mediapipeGesture: string;
  label: string;
  staffMessage: string;
  priority: TriagePriority;
  minScore: number;
  hint: string;
}

export type VisitMessage =
  | { type: 'peer_joined'; role: VisitRole; at: number }
  | { type: 'phrase_loading'; phraseId: string; english: string; cantonese: string }
  | {
      type: 'phrase_output';
      phraseId: string;
      english: string;
      cantonese: string;
      signWriting: string[];
      poseBase64: string | null;
    }
  | {
      type: 'patient_gesture';
      gesture: HospitalGesturePayload | null;
      rawGesture: string | null;
      stability: number;
    }
  | { type: 'triage_dismiss' };

export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function getRoomFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('room')?.toUpperCase() ?? null;
}

export function patientVisitUrl(roomId: string): string {
  return `${window.location.origin}/care/patient?room=${roomId}`;
}

export function staffVisitUrl(roomId: string): string {
  return `${window.location.origin}/care/staff?room=${roomId}`;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBlob(base64: string, type = 'application/octet-stream'): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

type VisitListener = (message: VisitMessage) => void;

export class VisitRoomSync {
  private channel: BroadcastChannel;
  private listeners = new Set<VisitListener>();

  constructor(roomId: string) {
    this.channel = new BroadcastChannel(`easysign-visit-${roomId.toUpperCase()}`);
    this.channel.onmessage = (event: MessageEvent<VisitMessage>) => {
      for (const listener of this.listeners) listener(event.data);
    };
  }

  publish(message: VisitMessage): void {
    this.channel.postMessage(message);
  }

  subscribe(listener: VisitListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  close(): void {
    this.channel.close();
    this.listeners.clear();
  }
}
