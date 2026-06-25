import React from "react";
import styles from "./RankBadges.module.css";

// ── Medalha de Ouro com fogo ─────────────────────────────
const GoldMedal = () => (
  <div className={styles.medalWrapper}>
    {/* Fogo acima da medalha */}
    <div className={styles.fireWrap}>
      <div className={`${styles.flame} ${styles.f1}`} />
      <div className={`${styles.flame} ${styles.f2}`} />
      <div className={`${styles.flame} ${styles.f3}`} />
      <div className={`${styles.flame} ${styles.f4}`} />
      <div className={`${styles.ember} ${styles.e1}`} />
      <div className={`${styles.ember} ${styles.e2}`} />
      <div className={`${styles.ember} ${styles.e3}`} />
      <div className={`${styles.ember} ${styles.e4}`} />
    </div>

    {/* Glow laranja */}
    <div className={styles.goldGlow} />

    {/* Medalha SVG */}
    <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.medalSvg}>
      {/* Fita */}
      <path d="M13 0 L19 10 L25 0Z" fill="#f59e0b" opacity="0.9"/>
      <rect x="12" y="0" width="5" height="12" rx="1" fill="#fbbf24"/>
      <rect x="21" y="0" width="5" height="12" rx="1" fill="#d97706"/>
      {/* Círculo externo */}
      <circle cx="19" cy="30" r="15" fill="#d97706"/>
      {/* Círculo interno */}
      <circle cx="19" cy="30" r="12" fill="#fbbf24"/>
      {/* Brilho interno */}
      <circle cx="19" cy="30" r="10" fill="url(#goldInner)"/>
      {/* Estrela/detalhe */}
      <circle cx="19" cy="30" r="6" fill="#f59e0b" opacity="0.6"/>
      {/* Número */}
      <text x="19" y="34.5" textAnchor="middle" fill="#7c3a00" fontSize="10" fontWeight="900" fontFamily="sans-serif">1</text>
      <defs>
        <radialGradient id="goldInner" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </radialGradient>
      </defs>
    </svg>

    {/* Número ao lado */}
    <span className={`${styles.rankNumber} ${styles.rankGold}`}>#1</span>
  </div>
);

// ── Medalha de Prata ─────────────────────────────────────
const SilverMedal = () => (
  <div className={styles.medalWrapper}>
    {/* Partículas girando */}
    <div className={styles.starRing}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={styles.starParticle}
          style={{ "--star-i": i } as React.CSSProperties}
        />
      ))}
    </div>

    <div className={styles.silverGlow} />

    <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.medalSvg}>
      <path d="M13 0 L19 10 L25 0Z" fill="#9ca3af" opacity="0.9"/>
      <rect x="12" y="0" width="5" height="12" rx="1" fill="#d1d5db"/>
      <rect x="21" y="0" width="5" height="12" rx="1" fill="#6b7280"/>
      <circle cx="19" cy="30" r="15" fill="#6b7280"/>
      <circle cx="19" cy="30" r="12" fill="#9ca3af"/>
      <circle cx="19" cy="30" r="10" fill="url(#silverInner)"/>
      <circle cx="19" cy="30" r="6" fill="#9ca3af" opacity="0.5"/>
      <text x="19" y="34.5" textAnchor="middle" fill="#1f2937" fontSize="10" fontWeight="900" fontFamily="sans-serif">2</text>
      <defs>
        <radialGradient id="silverInner" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#9ca3af"/>
        </radialGradient>
      </defs>
    </svg>

    <span className={`${styles.rankNumber} ${styles.rankSilver}`}>#2</span>
  </div>
);

// ── Medalha de Bronze ────────────────────────────────────
const BronzeMedal = () => (
  <div className={styles.medalWrapper}>
    {/* Faíscas */}
    <div className={styles.sparkWrap}>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={styles.spark}
          style={{ "--spark-i": i } as React.CSSProperties}
        />
      ))}
    </div>

    <div className={styles.bronzeGlow} />

    <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.medalSvg}>
      <path d="M13 0 L19 10 L25 0Z" fill="#cd7c2f" opacity="0.9"/>
      <rect x="12" y="0" width="5" height="12" rx="1" fill="#d97706"/>
      <rect x="21" y="0" width="5" height="12" rx="1" fill="#92400e"/>
      <circle cx="19" cy="30" r="15" fill="#92400e"/>
      <circle cx="19" cy="30" r="12" fill="#cd7c2f"/>
      <circle cx="19" cy="30" r="10" fill="url(#bronzeInner)"/>
      <circle cx="19" cy="30" r="6" fill="#cd7c2f" opacity="0.5"/>
      <text x="19" y="34.5" textAnchor="middle" fill="#431407" fontSize="10" fontWeight="900" fontFamily="sans-serif">3</text>
      <defs>
        <radialGradient id="bronzeInner" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#cd7c2f"/>
        </radialGradient>
      </defs>
    </svg>

    <span className={`${styles.rankNumber} ${styles.rankBronze}`}>#3</span>
  </div>
);

// ── Badge genérico para 4º+ ──────────────────────────────
const DefaultBadge = ({ index }: { index: number }) => (
  <div className={styles.medalWrapper}>
    <div className={styles.defaultBadge}>
      <span>{index + 1}</span>
    </div>
    <span className={`${styles.rankNumber} ${styles.rankDefault}`}>#{index + 1}</span>
  </div>
);

export const RankBadge = ({ index }: { index: number }) => {
  if (index === 0) return <GoldMedal />;
  if (index === 1) return <SilverMedal />;
  if (index === 2) return <BronzeMedal />;
  return <DefaultBadge index={index} />;
};