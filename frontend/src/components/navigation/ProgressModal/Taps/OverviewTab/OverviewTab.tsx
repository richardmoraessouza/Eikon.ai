"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from './OverviewTab.module.css';
import { useDragScroll } from '@/hooks/useDragScroll/useDragScroll';
import { getFrameImagePath } from '@/utils/frame';

interface OverviewTabProps {
  currentLevel: number;
  xpAtual: number;
  xpNecessario: number;
  pct: number;
  fillPx: number;
  loading: boolean;
  onOpenPremiumModal?: () => void;
}

const LEVEL_TICKS = Array.from({ length: 100 }, (_, i) => i + 1);
const TICK_SPACING = 64;
const TRACK_WIDTH = (LEVEL_TICKS.length - 1) * TICK_SPACING;
const LEVEL_REWARDS: Record<number, string[]> = {
  5: ['cat'],
  10: ['foxy'],
  19: ['cyberpunk'],
  20: ['rainbow'],
  35: ['dark', 'diamond'],
  88: ['horror'],
};

const OverviewTab: React.FC<OverviewTabProps> = ({
  currentLevel,
  xpAtual,
  xpNecessario,
  pct,
  fillPx,
  loading,
  onOpenPremiumModal,
}) => {
  const { carouselRef: trackScrollRef, dragProps } = useDragScroll({ axis: 'x', speed: 1.5 });
  const rewardLevels = Object.keys(LEVEL_REWARDS)
    .map(Number)
    .sort((a, b) => a - b);
  const activeRewardLevel = rewardLevels.find((level) => level >= currentLevel) ?? rewardLevels[rewardLevels.length - 1] ?? null;

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
          <p className={styles.overviewHint}>Veja seu progresso e desempenho no jogo.</p>
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
              const rewards = LEVEL_REWARDS[mark];
              const showReward = Boolean(rewards?.length);

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
                        {rewards.map((frame) => {
                          const imagePath = getFrameImagePath(frame);

                          return imagePath ? (
                            <div key={frame} className={styles.rewardImageBox}>
                              <Image
                                src={imagePath}
                                alt={frame}
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