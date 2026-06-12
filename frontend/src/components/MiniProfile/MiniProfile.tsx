import styles from './MiniProfile.module.css';
import type { MiniProfileType } from "../../types/users/users";
import { normalizeFrame } from "../../utils/frame";

interface MiniProfileProps extends MiniProfileType {
  onClose?: () => void;
  badge?: {
    icon?: string;
    nome: string;
    xp: number;
  };
  nivel?: number;
}

const MiniProfile = ({
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

          {foto ? (
            <img
              src={foto}
              alt={nome}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {iniciais}
            </div>
          )}

          {caminhoMoldura && (
            <img
              src={caminhoMoldura}
              alt=""
              className={styles.avatarMoldura}
            />
          )}

          <span className={`${styles.presenceDot} ${is_online ? styles.dotOnline : styles.dotOffline}`} />
        </div>

        <div className={styles.headerInfo}>
          <span className={styles.nome}>{nome}</span>
          <span className={styles.descricao}>{descricao}</span>
          <div className={styles.statusRow}>
            <span className={`${styles.statusDot} ${is_online ? styles.dotOnline : styles.dotOffline}`} />
            <span className={`${styles.statusText} ${is_online ? styles.statusOnline : styles.statusOffline}`}>
              {is_online ? 'Online' : 'Offline'}
            </span>
          </div>
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
                <span className={styles.badgeName}>{badge.nome}fsds</span>
                <span className={styles.badgeXp}>
                  {badge.xp.toLocaleString('pt-BR')} XP acumulados
                </span>
              </div>
            </div>
          )}

          {nivel !== undefined && (
            <div className={styles.row}>
              <div className={styles.levelCircle}>{nivel}fdsd</div>
              <span className={styles.levelLabel}>fdsfsdNível atual</span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default MiniProfile;