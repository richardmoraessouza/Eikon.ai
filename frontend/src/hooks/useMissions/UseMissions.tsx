import { useState, useEffect, useCallback } from "react";
import { getDailyMissions, addXpUserService, getUserXpService, getUserLevelService, updateMissionProgress } from "@/services/missions/missionsService";
import type { DailyMission } from "../../types/missions/missions";

export function useMissions(usuarioId: number | undefined) {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reseta o estado local de missões caso o usuário logado mude
  useEffect(() => {
    setMissions([]);
    setError(null);
  }, [usuarioId]);

  // Carrega as missões diárias do banco de dados
  
  useEffect(() => {
    if (usuarioId == null || Number.isNaN(usuarioId)) return;
    const id = usuarioId; // narrowed: const, TS confia que é `number` daqui pra frente

    async function loadMissions() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDailyMissions(id);

        setMissions(data);
      } catch (err) {
        console.error("Error loading daily missions hook:", err);
        setError("Erro ao carregar missões diárias.");
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, [usuarioId]);
  // Função disparada no front-end para atualizar o progresso de uma missão de forma reativa
  const handleTrackProgress = useCallback(async (missionId: number, incremento: number = 1) => {
    if (!usuarioId || isNaN(usuarioId)) return;

    try {
      const result = await updateMissionProgress(usuarioId, missionId, incremento);

      setMissions((prevMissions) =>
        prevMissions.map((m) =>
          m.mission_id === missionId
            ? { ...m, progresso: result.progresso, completada: result.completada }
            : m
        )
      );

      return result;
    } catch (err) {
      console.error("Error tracking progress in hook:", err);
    }
  }, [usuarioId]);

  // Fetch current level of a user by ID
  const getUserLevel = useCallback(async (usuarioId: number) => {
    return await getUserLevelService(usuarioId);
  }, []);

  // Fetch current total XP of a user by ID
  const getUserXp = useCallback(async (usuarioId: number) => {
    return await getUserXpService(usuarioId);
  }, []);

  // Add XP to a user — returns updated nivel and xp_atual
  const addXp = useCallback(
    async (usuarioId: number, xpGanho: number, token: string) => {
      return await addXpUserService(usuarioId, xpGanho, token);
    },
    []
  );

  return { missions, loading, error, handleTrackProgress, getUserLevel, getUserXp, addXp };
}