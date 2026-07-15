"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./MissionsTab.module.css";
import { useAuth } from "@/contexts/AuthContext/AuthContext";
import { useMissions } from "@/hooks/useMissions/UseMissions";
import { useDragScroll } from "@/hooks/useDragScroll/useDragScroll";

interface MissionsProps {
  coletadas?: Set<number>;
  coletandoMissao?: number | null;
  onColetar?: (missionId: number, nome: string) => void;
}

const LIGHT_LOGO = "/image/logo-dark.png";
const DARK_LOGO = "/image/logo-white.png";

export default function MissionsTabs({ coletadas, coletandoMissao, onColetar }: MissionsProps) {
  const { usuarioId } = useAuth();
  const usuarioIdNum = usuarioId ? Number(usuarioId) : undefined;
  const { missions, loading, error } = useMissions(usuarioIdNum);
  const { carouselRef, hasDragged, dragProps } = useDragScroll({ axis: "y" });
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const root = document.documentElement;
      const theme = root.getAttribute("data-theme");
      setIsDarkTheme(theme === "dark");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  if (!usuarioId) return null;

  const renderState = (content: string, isError = false) => (
    <div className={styles.missionsStateBox}>
      <p className={isError ? styles.missionsError : styles.missionsState}>{content}</p>
    </div>
  );

  return (
    <section className={styles.missionsSection}>
      <div className={styles.missionsHeader}>
        <div>
          <p className={styles.missionsLabel}>Missões diárias</p>
          <p className={styles.missionsHint}>Conclua as metas e receba XP diretamente no painel.</p>
        </div>
      </div>

      <div
        className={`${styles.missionsScroll} ${hasDragged ? styles.dragging : ""}`}
        ref={carouselRef}
        {...dragProps}
      >
        {loading && (
          <div className={styles.skeletonList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonIcon} />
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitleRow}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
                    <div className={styles.skeletonBadge} />
                  </div>
                  <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                  <div className={styles.skeletonBar} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && error && renderState(error, true)}
        {!loading && !error && missions.length === 0 && renderState("Nenhuma missão disponível no momento.")}

        {!loading && !error && missions.map((m) => {
          const concluida = m.progresso >= m.objetivo;
          const jáColetada = Boolean(m.coletada_em);
          const coletada = jáColetada || (coletadas?.has(m.mission_id) ?? false);
          const coletando = coletandoMissao === m.mission_id;
          const bar = Math.min(100, Math.round((m.progresso / Math.max(m.objetivo, 1)) * 100));
          const podeColeta = concluida && !coletada;

          return (
            <article
              key={m.mission_id}
              className={`${styles.missionItem} ${concluida ? styles.missionItemCompleted : ""}`}
            >
              <div className={styles.missionMain}>
                <div className={styles.missionIcon} aria-hidden="true">
                  <Image
                    src={isDarkTheme ? DARK_LOGO : LIGHT_LOGO}
                    alt="logo"
                    width={28}
                    height={28}
                    className={styles.missionImage}
                  />
                </div>

                <div className={styles.missionInfo}>
                  <div className={styles.missionTitleRow}>
                    <p className={styles.missionName}>{m.titulo}</p>
                    <span className={`${styles.missionBadge} ${concluida ? styles.missionBadgeComplete : ""}`}>
                      {concluida ? "Pronto" : "Andamento"}
                    </span>
                  </div>

                  {m.descricao && <p className={styles.missionDescription}>{m.descricao}</p>}

                  <div
                    className={styles.missionBar}
                    role="progressbar"
                    aria-valuenow={bar}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className={styles.missionFill} style={{ width: `${bar}%` }} />
                  </div>

                  <div className={styles.missionMeta}>
                    <span className={styles.missionPct}>
                      {concluida ? "Concluída!" : `${m.progresso} / ${m.objetivo}`}
                    </span>
                    <span className={styles.missionXp}>+{m.xp} XP</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`${styles.missionRewardBtn} ${!podeColeta ? styles.rewardDisabled : ""}`}
                onClick={() => podeColeta && onColetar?.(m.mission_id, m.titulo)}
                disabled={!podeColeta}
              >
                {coletando ? "..." : coletada ? "Coletado" : concluida ? "Concluído" : "Incompleto"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
