/**
 * Componente MiniProfile - Exibe o resumo do perfil do usuário
 * Renderizado nativamente como Server Component (SSR/RSC) para máxima performance.
 */

import React from 'react';
import Image from 'next/image'; // Importado para otimização nativa de avatares e molduras
import styles from './MiniProfile.module.css';
import type { MiniProfileType } from "../../../types/users/users";
import { normalizeFrame } from "../../../utils/frame";

interface MiniProfileProps extends MiniProfileType {
  onClose?: () => void;
  badge?: {
    icon?: string;
    nome: string;
    xp: number;
  };
  nivel?: number;
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

          {foto ? (
            <div className="relative w-12 h-12"> {/* Ajuste a largura/altura baseada no seu CSS */}
              <Image
                src={foto}
                alt={nome || 'Avatar'}
                fill
                sizes="48px"
                className={styles.avatar}
                style={{ objectFit: 'cover' }}
                unoptimized // Útil se as fotos de perfil vierem de URLs externas dinâmicas
              />
            </div>
          ) : (
            <div className={styles.avatarFallback}>
              {iniciais}
            </div>
          )}

          {caminhoMoldura && (
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src={caminhoMoldura}
                alt=""
                fill
                sizes="48px"
                className={styles.avatarMoldura}
                style={{ objectFit: 'contain' }}
              />
            </div>
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
                <span className={styles.badgeName}>{badge.nome}</span>
                <span className={styles.badgeXp}>
                  {badge.xp.toLocaleString('pt-BR')} XP acumulados
                </span>
              </div>
            </div>
          )}

          {nivel !== undefined && (
            <div className={styles.row}>
              {/* Removidos os caracteres residuais "fdsd" e "fdsfsd" */}
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