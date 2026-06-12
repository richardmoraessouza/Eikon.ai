import { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useAuth } from '../../../../hooks/AuthContext/AuthContext';
import { useUsers } from '../../../../hooks/useUsers/useUsers';
import { normalizeFrame } from '../../../../utils/frame';
import styles from './TapsFrames.module.css';

const FRAMES = [
  { id: 'frameCat', file: 'frameCat.png', label: 'Cat' },
  { id: 'frameCyberpunk', file: 'frameCyberpunk.png', label: 'Cyberpunk' },
  { id: 'frameFoxy', file: 'frameFoxy.png', label: 'Foxy' },
  { id: 'frameDark', file: 'frameDark.png', label: 'Dark' },
  { id: 'frameRainbow', file: 'frameRainbow.png', label: 'Rainbow' },
  { id: 'frameHorror', file: 'frameHorror.png', label: 'Horror' },
];

const TapsFrames = () => {
  const { usuarioId, fotoPerfil, frame, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string | null>(() => normalizeFrame(frame));
  const [saving, setSaving] = useState(false);
  const { updateFrame } = useUsers(usuarioId);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setSelected(normalizeFrame(frame));
  }, [frame]);

  const handleSelect = (file: string) => {
    setSelected(prev => (prev === file ? null : file));
  };

  const handleSave = async () => {
    if (!usuarioId) return;

    const frameToSave = selected ?? '';

    try {
      setSaving(true);

      const updated = await updateFrame(usuarioId, frameToSave);
      const savedFrame = normalizeFrame(updated?.frame ?? frameToSave);

      updateProfile({ frame: savedFrame });

      setSelected(savedFrame);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar frame:', err);
    } finally {
      setSaving(false);
    }
  };

  // 1. Estado de Carregamento Inicial (Skeleton enquanto o contexto do Auth carrega o usuarioId)
  if (!usuarioId) {
    return (
      <section className={styles.section} aria-busy="true">
        <div className={styles.previewBig}>
          <div className={styles.previewBigWrapper}>
            <div className={`${styles.previewBigAvatar} ${styles.skeletonCircle}`} />
          </div>
          <div className={styles.skeletonTextRow} style={{ width: '150px', margin: '0 auto' }} />
        </div>

        <div className={styles.divider} />

        <div className={styles.grid}>
          {/* Renderiza skeletons para a opção "Nenhuma" + os 5 frames fixos */}
          {Array.from({ length: FRAMES.length + 1 }).map((_, index) => (
            <div key={`frame-skeleton-${index}`} className={`${styles.frameCard} ${styles.skeletonCard}`}>
              <div className={styles.previewWrapper}>
                <div className={`${styles.previewAvatar} ${styles.skeletonCircle}`} />
              </div>
              <div className={styles.skeletonTextRow} style={{ width: '60px', marginTop: '8px' }} />
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.skeletonButton} />
        </div>
      </section>
    );
  }

  // 2. Renderização Principal do Componente
  return (
    <section className={styles.section}>
      <div className={styles.previewBig}>
        <div className={styles.previewBigWrapper}>
          <img
            src={fotoPerfil || '/image/semPerfil.jpg'}
            alt="Seu avatar"
            className={styles.previewBigAvatar}
          />
          {selected && (
            <img
              src={`/image/frames/${selected}`}
              alt="Frame selecionado"
              className={styles.previewBigFrame}
            />
          )}
        </div>
        <p className={styles.previewBigLabel}>
          {selected ? 'Pré-visualização com frame' : 'Sem frame selecionado'}
        </p>
      </div>

      <div className={styles.divider} />

      <div className={styles.grid}>
        <button
          className={`${styles.frameCard} ${selected === null ? styles.frameCardSelected : ''}`}
          onClick={() => setSelected(null)}
        >
          <div className={styles.previewWrapper}>
            <img
              src={fotoPerfil || '/image/semPerfil.jpg'}
              alt="Sem moldura"
              className={styles.previewAvatar}
            />
            {selected === null && (
              <div className={styles.selectedBadge}>
                <FiCheck size={10} />
              </div>
            )}
          </div>
          <span className={styles.frameLabel}>Nenhuma</span>
        </button>

        {FRAMES.map(frameItem => (
          <button
            key={frameItem.id}
            className={`${styles.frameCard} ${selected === frameItem.file ? styles.frameCardSelected : ''}`}
            onClick={() => handleSelect(frameItem.file)}
          >
            <div className={styles.previewWrapper}>
              <img
                src={fotoPerfil || '/image/semPerfil.jpg'}
                alt="Preview"
                className={styles.previewAvatar}
              />
              <img
                src={`/image/frames/${frameItem.file}`}
                alt={frameItem.label}
                className={styles.previewFrame}
              />
              {selected === frameItem.file && (
                <div className={styles.selectedBadge}>
                  <FiCheck size={10} />
                </div>
              )}
            </div>
            <span className={styles.frameLabel}>{frameItem.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        {sucesso && (
          <span className={styles.successMsg}>
            <FiCheck size={13} /> Salvo com sucesso!
          </span>
        )}
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar frame'}
        </button>
      </div>
    </section>
  );
};

export default TapsFrames;