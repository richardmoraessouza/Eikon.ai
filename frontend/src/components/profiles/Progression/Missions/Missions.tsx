"use client";

import styles from "./Missions.module.css";
import { useAuth } from "@/contexts/AuthContext/AuthContext";
import Image from 'next/image'
import { useMissions } from "@/hooks/useMissions/UseMissions";
import { useDragScroll } from "@/hooks/useDragScroll/useDragScroll";

interface MissionsProps {
  coletadas: Set<number>;
  coletandoMissao: number | null;
  onColetar: (missionId: number, nome: string) => void;
}

const MISSION_ICONS: Record<string, string> = {
  TALK_CHARACTER: "ti-users",
  CHAT_MESSAGES: "ti-message-circle",
  CHAT_TIME: "ti-clock",
  DAILY_LOGIN: "ti-calendar",
  CONSECUTIVE_LOGIN: "ti-calendar",
  CREATE_CHAT: "ti-plus",
  FAVORITE_CHARACTER: "ti-heart",
  CHANGE_AVATAR: "ti-user",
  COMPLETE_PROFILE: "ti-user",
  USE_SEARCH: "ti-search",
  COLLECT_DAILY_REWARD: "ti-package",
  MAKE_CHARACTER_ANGRY: "ti-mood-angry",
  MAKE_CHARACTER_SAD: "ti-mood-sad",
  MAKE_CHARACTER_HAPPY: "ti-mood-smile",
  MAKE_CHARACTER_LOVE: "ti-heart-handshake",
};

function getMissionIcon(tipo: string) {
  return MISSION_ICONS[tipo] ?? "ti-star";
}

export default function Missions({ coletadas, coletandoMissao, onColetar }: MissionsProps) {
  const { usuarioId } = useAuth();
  const usuarioIdNum = usuarioId ? Number(usuarioId) : undefined;
  const { missions, loading, error } = useMissions(usuarioIdNum);

  const { carouselRef, hasDragged, dragProps } = useDragScroll({ axis: "y" });

  if (!usuarioId) return null;

  if (loading) {
    return (
      <div className={styles.missionsSection}>
        <p className={styles.missionsLabel}>Missões Diárias</p>
        <div className={styles.missionsScroll}>
          <p className={styles.missionsState}>Carregando missões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.missionsSection}>
        <p className={styles.missionsLabel}>Missões Diárias</p>
        <div className={styles.missionsScroll}>
          <p className={`${styles.missionsState} ${styles.missionsError}`}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.missionsSection}>
      <p className={styles.missionsLabel}>Missões Diárias</p>
      <div
        className={`${styles.missionsScroll} ${hasDragged ? styles.dragging : ""}`}
        ref={carouselRef}
        {...dragProps}
      >
        {missions.map((m) => {
          const concluida  = m.progresso >= m.objetivo;
          const jáColetada = Boolean(m.coletada_em);
          const coletada   = jáColetada || coletadas.has(m.mission_id);
          const coletando  = coletandoMissao === m.mission_id;
          const bar        = Math.min(100, Math.round((m.progresso / m.objetivo) * 100));
          const podeColeta = concluida && !coletada;

          return (
            <div key={m.mission_id} className={styles.missionItem}>
              <div className={styles.missionIcon}>
                 <Image src="/image/logo-dark.png" alt="logo" width={40} height={40} className={`${styles.darkLogo}`}/>
                 <Image src="/image/logo-white.png" alt="logo" width={40} height={40} className={styles.lightLogo} />
              </div>

              <div className={styles.missionInfo}>
                <p className={styles.missionName}>{m.titulo}</p>
                {m.descricao && (
                  <p className={styles.missionDescription}>{m.descricao}</p>
                )}
                <div
                  className={styles.missionBar}
                  role="progressbar"
                  aria-valuenow={bar}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className={styles.missionFill} style={{ width: `${bar}%` }} />
                </div>
                <p
                  className={styles.missionPct}
                  style={concluida ? { color: "var(--settings-accent)" } : undefined}
                >
                  {concluida ? "Concluída!" : `${m.progresso} / ${m.objetivo}`}
                </p>
              </div>

              <button
                type="button"
                className={styles.missionRewardBtn}
                onClick={() => podeColeta && onColetar(m.mission_id, m.titulo)}
                disabled={!podeColeta}
              >
                <p
                  className={styles.missionReward}
                  style={coletada ? { color: "var(--settings-text-muted)" } : undefined}
                >
                  {coletando ? "..." : `+${m.xp} XP`}
                </p>
                <p className={styles.missionRewardLabel}>
                  {coletada ? "coletado" : concluida ? "coletar" : "recompensa"}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}