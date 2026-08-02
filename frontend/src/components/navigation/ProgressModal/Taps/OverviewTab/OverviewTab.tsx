"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './OverviewTab.module.css';
import { useDragScroll } from '@/hooks/useDragScroll/useDragScroll';
import type { FrameUnlock } from '@/types/users/users';
import { getFrameImagePath } from '@/utils/frame';

interface OverviewTabProps {
  currentLevel: number;
  xpAtual: number;
  xpNecessario: number;
  pct: number;
  fillPx: number;
  loading: boolean;
  frameUnlocks?: FrameUnlock[];
  onOpenPremiumModal?: () => void;
}

const LEVEL_TICKS = Array.from({ length: 100 }, (_, i) => i + 1);
const TICK_SPACING = 64;
const TRACK_WIDTH = (LEVEL_TICKS.length - 1) * TICK_SPACING;

const OverviewTab: React.FC<OverviewTabProps> = ({
  currentLevel,
  xpAtual,
  xpNecessario,
  pct,
  fillPx,
  loading,
  frameUnlocks = [],
  onOpenPremiumModal,
}) => {
  const { carouselRef: trackScrollRef, dragProps } = useDragScroll({ axis: 'x', speed: 1.5 });

  const rewardsByLevel = frameUnlocks.reduce<Record<number, FrameUnlock[]>>((acc, frameUnlock) => {
    const requiredLevel = Number(frameUnlock?.requiredLevel);
    if (!Number.isFinite(requiredLevel)) return acc;

    if (!acc[requiredLevel]) acc[requiredLevel] = [];
    acc[requiredLevel].push(frameUnlock);
    return acc;
  }, {});

  useEffect(() => {
    if (!trackScrollRef.current) return;
    const container = trackScrollRef.current;
    const targetX = (currentLevel - 1) * TICK_SPACING;
    // centraliza o nível atual na área visível
    container.scrollTo({
      left: Math.max(0, targetX - container.clientWidth / 2),
      behavior: 'smooth',
    });
  }, [currentLevel]);

  return (
    <div className={styles.wrap}>
      <div className={styles.stickyHeader}>
        <div className={styles.overviewHeader}>
          <p className={styles.overviewLabel}>Visão Geral</p>
          <p className={styles.overviewHint}>Acompanhe seu avanço, conquistas e evolução na plataforma.</p>
        </div>
        
        <div className={styles.header}>
          <div className={styles.levelCircleWrap}>
            <div className={styles.bigLevelCircle}>
              <span>{currentLevel}</span>
            </div>
            <div className={styles.xpInfo}>
              <p className={styles.xpLabel}>Próximo nível</p>
              <p className={styles.xpVal}><strong>{xpAtual} / {xpNecessario}</strong> pts</p>
            </div>
          </div>
          <div className={styles.xpBarWrap}>
            <div
              className={styles.xpBarBg}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.xpBarFill} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rewardOverview}>
        {loading ? (
          <div className={styles.rewardOverviewEmpty}>
            <p className={styles.rewardOverviewMessage}>Carregando próxima recompensa...</p>
          </div>
        ) : (() => {
          const nextReward = [...frameUnlocks]
            .filter((frameUnlock) => !frameUnlock.unlocked)
            .sort((a, b) => Number(a.requiredLevel ?? 0) - Number(b.requiredLevel ?? 0))[0];

          if (!nextReward) {
            return (
              <div className={styles.rewardOverviewEmpty}>
                <p className={styles.rewardOverviewMessage}>Você já desbloqueou todas as recompensas disponíveis.</p>
              </div>
            );
          }

          const nextRewardLevel = Number(nextReward.requiredLevel);
          const nextRewardImagePath = getFrameImagePath(nextReward.file);
          const remainingLevels = Math.max(0, nextRewardLevel - currentLevel);

          return (
            <div className={styles.rewardPreview}>
              <div className={styles.rewardPreviewHeader}>
                <p className={styles.rewardPreviewTitle}>Próxima recompensa</p>
                <p className={styles.rewardPreviewSubtitle}>
                  {nextRewardLevel > 0 ? `Desbloqueie no nível ${nextRewardLevel}` : 'Continue subindo de nível para ganhar esta recompensa'}
                </p>
              </div>

              <div className={styles.rewardPreviewItems}>
                <div className={styles.rewardPreviewItem}>
                  {nextRewardImagePath ? (
                    <Image
                      src={nextRewardImagePath}
                      alt={nextReward.file}
                      width={56}
                      height={56}
                      className={styles.rewardPreviewImage}
                    />
                  ) : (
                    <div className={styles.rewardPreviewImage} style={{ width: 56, height: 56 }} />
                  )}

                  <div className={styles.rewardPreviewDetails}>
                    <p className={styles.rewardPreviewItemName}>Moldura especial</p>
                    <p className={styles.rewardPreviewItemText}>Sua próxima conquista de nível</p>
                    <p className={styles.rewardPreviewItemMeta}>
                      {remainingLevels > 0
                        ? `${remainingLevels} nível${remainingLevels > 1 ? 's' : ''} para desbloquear`
                        : 'Pronto para ser desbloqueada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className={styles.levelTrackOuter}>
        <div className={styles.levelTrackWrap} ref={trackScrollRef} {...dragProps}>
          <div
            className={styles.levelTrackInner}
            style={{ width: `${TRACK_WIDTH}px` }}
            role="progressbar"
            aria-valuenow={currentLevel}
            aria-valuemin={1}
            aria-valuemax={100}
            aria-label="Progresso de nível"
          >
            <div className={styles.levelTrackFill} style={{ width: `${fillPx}px` }} />
            {LEVEL_TICKS.map((mark) => {
              const rewards = rewardsByLevel[mark] ?? [];
              const showReward = Boolean(rewards.length);

              return (
                <div
                  key={mark}
                  className={styles.levelTickWrapper}
                  style={{ left: `${(mark - 1) * TICK_SPACING}px` }}
                >
                  <div
                    className={`${styles.levelTick} ${currentLevel >= mark ? styles.levelTickActive : ''} ${currentLevel === mark ? styles.levelTickCurrent : ''}`}
                  >
                    {mark}
                  </div>

                  {showReward ? (
                    <div className={styles.rewardTooltip} role="tooltip">
                      <div className={styles.rewardImagesRow}>
                        {rewards.map((frameUnlock) => {
                          const imagePath = getFrameImagePath(frameUnlock.file);

                          return imagePath ? (
                            <div key={frameUnlock.file} className={styles.rewardImageBox}>
                              <Image
                                src={imagePath}
                                alt={frameUnlock.file}
                                width={32}
                                height={32}
                                className={styles.rewardImage}
                              />
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.fadeLeft} />
        <div className={styles.fadeRight} />
      </div>

      <div className={styles.premiumPromo}>
        <div className={styles.promoContent}>
          <p className={styles.promoTitle}>Quer subir de nível mais rápido?</p>
          <p className={styles.promoText}>Acesse os planos premium e avance com mais velocidade.</p>
        </div>
        <button type="button" className={styles.premiumButton} onClick={onOpenPremiumModal}>
          Ver planos
        </button>
      </div>
    </div>
  );
};

export default OverviewTab;