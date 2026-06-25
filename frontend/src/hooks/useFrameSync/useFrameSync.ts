import { useEffect } from 'react';
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from '../../utils/frame';

export function useFrameSync(
  usuarioId: number | null | undefined,
  onFrameUpdate: (frame: string | null) => void
) {
  useEffect(() => {
    if (!usuarioId) return;

    const handler = (event: Event) => {
      const { usuarioId: updatedId, frame } = (event as CustomEvent<FrameUpdatedDetail>).detail;
      if (updatedId === usuarioId) {
        onFrameUpdate(frame);
      }
    };

    window.addEventListener(FRAME_UPDATED_EVENT, handler);
    return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
  }, [usuarioId, onFrameUpdate]);
}
