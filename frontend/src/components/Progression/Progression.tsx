"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import styles from "./Progression.module.css";
import { useAuth } from "@/hooks/AuthContext/AuthContext";
import { useMissions } from "@/hooks/useMissions/UseMissions";
import { useDragScroll } from "@/hooks/useDragScroll/useDragScroll";
import Missions from "./Missions/Missions";

interface ProgressionProps {
  onClose?: () => void;
}

function xpParaNivel(nivel: number) {
  return nivel < 10 ? 200 + (nivel - 1) * 100 : 1000;
}

// Um tracinho para CADA nível de 1 a 100
const LEVEL_TICKS = Array.from({ length: 100 }, (_, i) => i + 1);

const TICK_SPACING = 80;
const TRACK_WIDTH = (LEVEL_TICKS.length - 1) * TICK_SPACING;

export default function Progression({ onClose }: ProgressionProps) {
  const { usuarioId, token } = useAuth();
  const usuarioIdNum = useMemo(() => (usuarioId ? Number(usuarioId) : undefined), [usuarioId]);

  const { getUserLevel, getUserXp, addXp } = useMissions(usuarioIdNum);

  const [currentLevel, setCurrentLevel]       = useState(1);
  const [xpAtual, setXpAtual]                 = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [enviandoXp, setEnviandoXp]           = useState(false);
  const [erroXp, setErroXp]                   = useState<string | null>(null);
  const [coletadas, setColetadas]             = useState<Set<string>>(new Set());
  const [coletandoMissao, setColetandoMissao] = useState<string | null>(null);

  const { carouselRef: trackScrollRef, dragProps, hasDragged, resetHasDragged } = useDragScroll({ axis: "x", speed: 1.5 });

  const currentLevelNum = Number(currentLevel) || 1;
  const xpAtualNum = Number(xpAtual) || 0;
  const xpNecessario = xpParaNivel(currentLevelNum);
  const pct = Math.min(Math.round((xpAtualNum / Math.max(xpNecessario, 1)) * 100), 100);
  const xpRestante = Math.max(xpNecessario - xpAtualNum, 0);

  // Posição fracionária: nível atual + progresso de XP dentro do nível (0 a 1)
  const levelProgressFraction = useMemo(() => {
    const fracaoDentroDoNivel = xpNecessario > 0 ? xpAtualNum / xpNecessario : 0;
    return (currentLevelNum - 1) + Math.min(Math.max(fracaoDentroDoNivel, 0), 1);
  }, [currentLevelNum, xpAtualNum, xpNecessario]);

  // Posição em pixels dentro da trilha (não porcentagem — precisa ser px por causa do scroll)
  const fillPx = Math.min(levelProgressFraction * TICK_SPACING, TRACK_WIDTH);

  useEffect(() => {
    if (usuarioIdNum == null) return;
    let cancelled = false;

    async function loadUserProgress() {
      try {
        setLoading(true);
        const [nivel, xp] = await Promise.all([
          getUserLevel(usuarioIdNum!),
          getUserXp(usuarioIdNum!),
        ]);
        if (cancelled) return;
        setCurrentLevel(Number(nivel) || 1);
        setXpAtual(Number(xp) || 0);
      } catch (err) {
        console.error("Erro ao carregar progresso:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUserProgress();
    return () => { cancelled = true; };
  }, [usuarioIdNum, getUserLevel, getUserXp]);

  // Centraliza o scroll da trilha no nível atual sempre que ele mudar
  useEffect(() => {
    if (!trackScrollRef.current) return;
    const container = trackScrollRef.current;
    const containerWidth = container.clientWidth;
    const target = Math.max(fillPx - containerWidth / 2, 0);
    container.scrollTo({ left: target, behavior: "smooth" });
  }, [fillPx, loading, trackScrollRef]);

  // Fecha o modal com Esc
  useEffect(() => {
    if (!onClose) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function enviarXpTeste() {
    if (!usuarioIdNum || !token || enviandoXp) return;
    try {
      setEnviandoXp(true);
      setErroXp(null);
      const resultado = await addXp(usuarioIdNum, 100, token);
      if (resultado) {
        setCurrentLevel(Number(resultado.nivel) || currentLevelNum);
        setXpAtual(Number(resultado.xp_atual) || 0);
      }
    } catch (err) {
      console.error("Erro ao enviar XP:", err);
      setErroXp("Não foi possível enviar XP. Tente novamente.");
    } finally {
      setEnviandoXp(false);
    }
  }

  const coletarMissao = useCallback(async (missaoNome: string, xpGanho: number) => {
    if (!usuarioIdNum || !token) return;
    if (coletadas.has(missaoNome) || coletandoMissao) return;
    try {
      setColetandoMissao(missaoNome);
      const resultado = await addXp(usuarioIdNum, xpGanho, token);
      if (resultado) {
        setCurrentLevel(Number(resultado.nivel) || currentLevelNum);
        setXpAtual(Number(resultado.xp_atual) || 0);
        setColetadas((prev) => new Set(prev).add(missaoNome));
      }
    } catch (err) {
      console.error("Erro ao coletar XP:", err);
    } finally {
      setColetandoMissao(null);
    }
  }, [usuarioIdNum, token, coletadas, coletandoMissao, addXp]);

  if (!usuarioId) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.wrap}>
          <p className={styles.stateMessage}>Usuário não logado</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.wrap}>
          <p className={styles.stateMessage}>Carregando progresso...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          resetHasDragged();
          return;
        }

        onClose?.();
      }}
    >
      <div
        className={styles.wrap}
        role="dialog"
        aria-modal="true"
        aria-label="Progressão de nível"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.stickyHeader}>
          <div className={styles.header}>
            <div className={styles.levelCircleWrap}>
              <div className={styles.bigLevelCircle}>
                <span>{currentLevel}</span>
              </div>
              <div>
                <p className={styles.xpLabel}>Próximo Nível</p>
                <p className={styles.xpVal}><strong>{xpAtualNum} / {xpNecessario}</strong> pts</p>
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
            <button className={styles.xpButton} onClick={enviarXpTeste} disabled={enviandoXp}>
              {enviandoXp ? "Enviando..." : "+100 XP"}
            </button>
          </div>

          {erroXp && <p className={styles.errorText}>{erroXp}</p>}
        </div>

        <Missions
          coletadas={coletadas}
          coletandoMissao={coletandoMissao}
          onColetar={coletarMissao}
        />

     <div className={styles.levelTrackWrap}>
          <div
            className={styles.levelTrackScroll}
            ref={trackScrollRef}
            {...dragProps}
          >
            <div
              className={styles.levelTrackInner}
              style={{ width: `${TRACK_WIDTH}px` }}
              role="progressbar"
              aria-valuenow={currentLevelNum}
              aria-valuemin={1}
              aria-valuemax={100}
              aria-label="Progresso de nível"
            >
              <div
                className={styles.levelTrackFill}
                style={{ width: `${fillPx}px` }}
              />
              {LEVEL_TICKS.map((mark) => (
                <div
                  key={mark}
                  className={`${styles.levelTick} ${
                    currentLevelNum >= mark ? styles.levelTickActive : ""
                  }`}
                  style={{ left: `${(mark - 1) * TICK_SPACING}px` }}
                >
                  {mark}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}