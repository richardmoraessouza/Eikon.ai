export type MidiaTipo = 'usuario' | 'personagem';

export const uploadMidia = async (
  file: File,
  tipo: MidiaTipo = 'usuario',
  previousPath?: string | null,
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);
  if (previousPath) {
    formData.append('previousPath', previousPath);
  }

  const response = await fetch('/api/supabase/upload', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.detail || payload?.error || 'Falha ao enviar mídia ao Supabase.');
  }

  return {
    path: payload.path,
    publicUrl: payload.publicUrl,
  };
};
