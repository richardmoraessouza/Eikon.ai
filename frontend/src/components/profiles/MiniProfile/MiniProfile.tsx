import Image from 'next/image';
import styles from './MiniProfile.module.css';
import type { MiniProfileType } from "../../../types/users/users";
import { normalizeFrame } from "../../../utils/frame";

interface MiniProfileProps extends MiniProfileType {
  badge?: {
    icon?: string;
    nome: string;
    xp: number;
  };
  nivel?: number | null;
  onClose?: () => void;
}

export const MiniProfile = ({
  nome,
  foto,
  descricao,
  frame,
  is_online,
  badge,
  nivel,
}: MiniProfileProps) => {
  const frameAtivo = normalizeFrame(frame);
  const caminhoMoldura = frameAtivo ? `/image/frames/${frameAtivo}` : null;

  const iniciais = nome
    ? nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className={styles.card}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.avatarWrap}>

          <div className={styles.avatarInner}>
            {foto ? (
              <Image
                src={foto}
                alt={nome || 'Avatar'}
                fill
                sizes="44px"
                className={styles.avatar}
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            ) : (
              <div className={styles.avatarFallback}>
                {iniciais}
              </div>
            )}
          </div>

          {caminhoMoldura && (
            <div className={styles.avatarMolduraWrap}>
              <Image
                src={caminhoMoldura}
                alt=""
                fill
                sizes="52px"
                className={styles.avatarMoldura}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
        </div>

        <div className={styles.headerInfo}>
          <span className={styles.nome} title={nome}>{nome}</span>
          {descricao && <span className={styles.descricao}>{descricao}</span>}
          <span className={`${styles.statusText} ${is_online ? styles.statusOnline : styles.statusOffline}`}>
            {is_online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      {(badge || nivel !== undefined) && (
        <div className={styles.body}>

          {badge && (
            <div className={styles.row}>
              <div className={styles.badgeIcon}>
                {badge.icon ?? '🏅'}
              </div>
              <div className={styles.badgeInfo}>
                <span className={styles.badgeName}>{badge.nome}</span>
                <span className={styles.badgeXp}>
                  {badge.xp.toLocaleString('pt-BR')} XP acumulados
                </span>
              </div>
            </div>
          )}

          {nivel !== undefined && nivel !== null && (
            <div className={styles.row}>
              <div className={styles.levelCircle}>{nivel}</div>
              <span className={styles.levelLabel}>Nível atual</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default MiniProfile;