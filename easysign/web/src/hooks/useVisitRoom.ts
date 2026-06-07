import { useCallback, useEffect, useRef, useState } from 'react';
import {
  VisitRoomSync,
  type VisitMessage,
  type VisitRole,
} from '../services/visitSync';

export function useVisitRoom(
  roomId: string | null,
  role: VisitRole,
  onMessage?: (message: VisitMessage) => void,
) {
  const syncRef = useRef<VisitRoomSync | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const [patientOnline, setPatientOnline] = useState(false);
  const [staffOnline, setStaffOnline] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const sync = new VisitRoomSync(roomId);
    syncRef.current = sync;

    sync.publish({ type: 'peer_joined', role, at: Date.now() });

    const unsubscribe = sync.subscribe((message) => {
      if (message.type === 'peer_joined') {
        if (message.role === 'patient') setPatientOnline(true);
        if (message.role === 'staff') setStaffOnline(true);
      }
      onMessageRef.current?.(message);
    });

    return () => {
      unsubscribe();
      sync.close();
      syncRef.current = null;
    };
  }, [roomId, role]);

  const publish = useCallback((message: VisitMessage) => {
    syncRef.current?.publish(message);
  }, []);

  return { publish, patientOnline, staffOnline };
}
