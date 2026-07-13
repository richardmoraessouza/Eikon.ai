import { useState, useEffect, useCallback } from "react";
import { getDailyMissions, claimMissionService, getUserXpService, getUserLevelService } from "@/services/missions/missionsService";
import { useAuth } from "@/contexts/AuthContext/AuthContext";
import type { DailyMission } from "../../types/missions/missions";

export function useMissions(usuarioId: number | undefined) {
  const { token } = useAuth();
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
    if (usuarioId == null || Number.isNaN(usuarioId)) {
      setMissions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const id = usuarioId;

    async function loadMissions() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDailyMissions(id, token ?? undefined);
        setMissions(data);
      } catch (err) {
        console.error("Error loading daily missions hook:", err);
        setError("Erro ao carregar missões diárias.");
      } finally {
        setLoading(false);
      }
    }

    loadMissions();
  }, [usuarioId, token]);

  // Fetch current level of a user by ID
  const getUserLevel = useCallback(async (usuarioId: number) => {
    return await getUserLevelService(usuarioId, token ?? undefined);
  }, [token]);

  // Fetch current total XP of a user by ID
  const getUserXp = useCallback(async (usuarioId: number) => {
    return await getUserXpService(usuarioId, token ?? undefined);
  }, [token]);

  const claimMission = useCallback(
    async (missionId: number) => {
      return await claimMissionService(missionId, token ?? undefined);
    },
    [token]
  );

  return { missions, loading, error, getUserLevel, getUserXp, claimMission };
}
