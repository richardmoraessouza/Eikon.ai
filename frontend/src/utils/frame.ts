export const FRAME_UPDATED_EVENT = 'usuario-frame-updated';

export interface FrameUpdatedDetail {
  usuarioId: number;
  frame: string | null;
}

const FRAME_DEFINITIONS: ReadonlyArray<{ value: string; file: string; legacyValues?: readonly string[] }> = [
  { value: 'cat', file: 'frameCat.png', legacyValues: ['bronze'] },
  { value: 'cyberpunk', file: 'frameCyberpunk.png' },
  { value: 'foxy', file: 'frameFoxy.png' },
  { value: 'dark', file: 'frameDark.png', legacyValues: ['diamond'] },
  { value: 'rainbow', file: 'frameRainbow.png' },
  { value: 'horror', file: 'frameHorror.png' },
];

function resolveFrameDefinition(frame: string | null | undefined) {
  const rawValue = frame?.trim();
  if (!rawValue) return null;

  const normalizedValue = rawValue.toLowerCase();
  const fileNameWithoutExtension = normalizedValue.replace(/\.png$/i, '');

  return FRAME_DEFINITIONS.find((definition) => {
    const legacyValues = definition.legacyValues ?? [];
    return (
      definition.value === normalizedValue ||
      definition.file === normalizedValue ||
      definition.file.toLowerCase().replace(/\.png$/i, '') === fileNameWithoutExtension ||
      legacyValues.includes(normalizedValue)
    );
  }) ?? null;
}

export function normalizeFrame(frame: string | null | undefined): string | null {
  return resolveFrameDefinition(frame)?.value ?? null;
}

export function getFrameImagePath(frame: string | null | undefined): string | null {
  const definition = resolveFrameDefinition(frame);
  return definition ? `/image/frames/${definition.file}` : null;
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
