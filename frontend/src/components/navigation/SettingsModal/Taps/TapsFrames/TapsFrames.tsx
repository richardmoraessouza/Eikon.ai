'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { FiCheck, FiLock } from 'react-icons/fi';
import { useAuth } from '../../../../../contexts/AuthContext/AuthContext';
import { useUsers } from '../../../../../hooks/useUsers/useUsers';
import { normalizeFrame } from '../../../../../utils/frame';
import styles from './TapsFrames.module.css';

const FRAMES = [
  { id: 'cat', value: 'cat', file: 'frameCat.png', label: 'Cat', legacyValues: ['bronze'] },
  { id: 'cyberpunk', value: 'cyberpunk', file: 'frameCyberpunk.png', label: 'Cyberpunk' },
  { id: 'foxy', value: 'foxy', file: 'frameFoxy.png', label: 'Foxy' },
  { id: 'dark', value: 'dark', file: 'frameDark.png', label: 'Dark', legacyValues: ['diamond'] },
  { id: 'rainbow', value: 'rainbow', file: 'frameRainbow.png', label: 'Rainbow' },
  { id: 'horror', value: 'horror', file: 'frameHorror.png', label: 'Horror' },
];

const resolveFrameValue = (value: string | null | undefined) => {
  const normalized = normalizeFrame(value);
  if (!normalized) return null;

  const match = FRAMES.find((frame) => {
    const legacyValues = frame.legacyValues ?? [];
    return frame.value === normalized || frame.file === normalized || frame.id === normalized || legacyValues.includes(normalized);
  });

  return match?.value ?? null;
};

const TapsFrames = () => {
  const { usuarioId, fotoPerfil, frame, token, updateProfile } = useAuth();
  const [selected, setSelected] = useState<string | null>(() => resolveFrameValue(frame));
  const [saving, setSaving] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [unlockedFrames, setUnlockedFrames] = useState<string[]>([]);
  const { updateFrame, getMiniProfile } = useUsers(usuarioId);

  useEffect(() => {
    setSelected(resolveFrameValue(frame));
  }, [frame]);

  useEffect(() => {
    if (!usuarioId) return;

    let cancelled = false;

    const carregarDesbloqueios = async () => {
      try {
        const miniProfile = await getMiniProfile(usuarioId);
        if (cancelled) return;
        setUnlockedFrames(Array.isArray(miniProfile.unlocked_frames) ? miniProfile.unlocked_frames : []);
      } catch (err) {
        console.error('Erro ao carregar molduras desbloqueadas:', err);
      }
    };

    carregarDesbloqueios();
    return () => {
      cancelled = true;
    };
  }, [usuarioId, getMiniProfile]);

  const selectedFrame = useMemo(() => {
    return FRAMES.find((frameItem) => frameItem.value === selected) ?? null;
  }, [selected]);

  const isFrameUnlocked = (frameItem: (typeof FRAMES)[number]) => {
    const legacyValues = frameItem.legacyValues ?? [];
    return unlockedFrames.includes(frameItem.value) || legacyValues.some((legacyValue) => unlockedFrames.includes(legacyValue));
  };

  const groupedFrames = useMemo(() => {
    const unlocked = FRAMES.filter((frameItem) => isFrameUnlocked(frameItem));
    const locked = FRAMES.filter((frameItem) => !isFrameUnlocked(frameItem));
    return { unlocked, locked };
  }, [unlockedFrames]);

  const handleSelect = (value: string) => {
    const frameItem = FRAMES.find((item) => item.value === value);
    if (!frameItem || !isFrameUnlocked(frameItem)) return;
    setSelected((prev) => (prev === value ? null : value));
  };

  const handleSave = async () => {
    if (!usuarioId) return;

    const frameToSave = selected ?? '';

    if (frameToSave && !unlockedFrames.includes(frameToSave)) {
      return;
    }

    try {
      setSaving(true);

      const updated = await updateFrame(usuarioId, frameToSave, token ?? undefined);
      const savedFrame = normalizeFrame(updated?.frame ?? frameToSave);

      updateProfile({ frame: savedFrame });
      setSelected(resolveFrameValue(savedFrame));
      setUnlockedFrames(Array.isArray((updated as { unlocked_frames?: string[] }).unlocked_frames) ? (updated as { unlocked_frames?: string[] }).unlocked_frames! : unlockedFrames);
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
          {/* Renderiza skeletons para a opção "Nenhuma" + os frames fixos */}
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
          <Image
            src={fotoPerfil || '/image/semPerfil.jpg'}
            alt="Seu avatar"
            className={styles.previewBigAvatar}
            width={160} // Ajuste conforme o tamanho real da preview grande no seu CSS
            height={160}
            priority // Carrega com prioridade por ser o elemento visual principal do topo
          />
          {selectedFrame && (
            <Image
              src={`/image/frames/${selectedFrame.file}`}
              alt="Frame selecionado"
              className={styles.previewBigFrame}
              width={170}
              height={170}
              priority
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
          type="button"
        >
          <div className={styles.previewWrapper}>
            <Image
              src={fotoPerfil || '/image/semPerfil.jpg'}
              alt="Sem moldura"
              className={styles.previewAvatar}
              width={64} // Ajuste conforme o tamanho dos cards do grid no seu CSS
              height={64}
            />
            {selected === null && (
              <div className={styles.selectedBadge}>
                <FiCheck size={10} />
              </div>
            )}
          </div>
          <span className={styles.frameLabel}>Nenhuma</span>
        </button>

        {groupedFrames.unlocked.map((frameItem) => {
          const isUnlocked = unlockedFrames.includes(frameItem.value);
          const isSelected = selected === frameItem.value;

          return (
            <button
              key={frameItem.id}
              className={`${styles.frameCard} ${isSelected ? styles.frameCardSelected : ''}`}
              onClick={() => handleSelect(frameItem.value)}
              type="button"
              disabled={!isUnlocked}
            >
              <div className={styles.previewWrapper}>
                <Image
                  src={fotoPerfil || '/image/semPerfil.jpg'}
                  alt="Preview"
                  className={styles.previewAvatar}
                  width={64}
                  height={64}
                />
                <Image
                  src={`/image/frames/${frameItem.file}`}
                  alt={frameItem.label}
                  className={styles.previewFrame}
                  width={70}
                  height={70}
                />
                {isSelected && (
                  <div className={styles.selectedBadge}>
                    <FiCheck size={10} />
                  </div>
                )}
              </div>
              <span className={styles.frameLabel}>{frameItem.label}</span>
            </button>
          );
        })}
      </div>

      {groupedFrames.locked.length > 0 && (
        <>
          <p className={styles.sectionLabel}>Bloqueadas</p>
          <div className={styles.grid}>
            {groupedFrames.locked.map((frameItem) => {
              const isSelected = selected === frameItem.value;

              return (
                <button
                  key={frameItem.id}
                  className={`${styles.frameCard} ${styles.frameCardLocked} ${isSelected ? styles.frameCardSelected : ''}`}
                  onClick={() => handleSelect(frameItem.value)}
                  type="button"
                  disabled
                >
                  <div className={styles.previewWrapper}>
                    <div className={styles.previewAvatarEmpty} />
                    <Image
                      src={`/image/frames/${frameItem.file}`}
                      alt={frameItem.label}
                      className={styles.previewFrame}
                      width={70}
                      height={70}
                    />
                    <div className={styles.lockBadge}>
                      <FiLock size={10} />
                    </div>
                    {isSelected && (
                      <div className={styles.selectedBadge}>
                        <FiCheck size={10} />
                      </div>
                    )}
                  </div>
                  <span className={styles.frameLabel}>{frameItem.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

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
          type="button"
        >
          {saving ? 'Salvando...' : 'Salvar frame'}
        </button>
      </div>
    </section>
  );
};

export default TapsFrames;