export const FRAME_UPDATED_EVENT = 'usuario-frame-updated';

export interface FrameUpdatedDetail {
  usuarioId: number;
  frame: string | null;
}

export function normalizeFrame(frame: string | null | undefined): string | null {
  const value = frame?.trim();
  return value ? value : null;
}

export function dispatchFrameUpdated(usuarioId: number, frame: string | null | undefined): void {
  window.dispatchEvent(
    new CustomEvent<FrameUpdatedDetail>(FRAME_UPDATED_EVENT, {
      detail: {
        usuarioId,
        frame: normalizeFrame(frame),
      },
    })
  );
}
