import axios from "axios";
import { API_URL } from "../../config/api";
import type { DailyMission, ProgressResponse } from "../../types/missions/missions";

// Busca as 5 missões diárias do usuário (ou força o sorteio no back-end)
export async function getDailyMissions(usuarioId: number): Promise<DailyMission[]> {
  try {
    const res = await axios.get<DailyMission[]>(`${API_URL}/missions/daily/${usuarioId}`);
    return res.data;
  } catch (err) {
    console.error("Error searching daily missions:", err);
    throw err;
  }
}

// Atualiza ou incrementa o progresso de uma missão no banco
export async function updateMissionProgress(
  usuarioId: number,
  missionId: number,
  incremento: number = 1
): Promise<ProgressResponse> {
  try {
    const res = await axios.post<ProgressResponse>(`${API_URL}/missions/progress`, {
      usuarioId,
      missionId,
      incremento,
    });
    return res.data;
  } catch (err) {
    console.error("Error updating mission progress:", err);
    throw err;
  }
}

// search user level by ID
export async function getUserLevelService(usuarioId: number): Promise<number> {
    if (!usuarioId) throw new Error('Usuario ID é obrigatório');

    try {
        const response = await axios.get(`${API_URL}/users/level-user/${usuarioId}`);
        return response.data.nivel ?? 1; // ← era só response.data
    } catch (error: any) {
        console.error(`Error fetching user level`, error.response?.data);
        throw error;
    }
}

// Search user xp by ID
export async function getUserXpService(usuarioId: number): Promise<number> {
    if (!usuarioId) throw new Error('Usuario ID é obrigatório');

    try {
        const response = await axios.get(`${API_URL}/users/xp-user/${usuarioId}`);
        return response.data.xp ?? 0; // ← era só response.data
    } catch (error: any) {
        console.error(`Error fetching user XP`, error.response?.data);
        throw error;
    }
}

export async function addXpUserService(
  usuarioId: number,
  xp: number,
  token: string
): Promise<{ nivel: number; xp_atual: number }> {
  if (!usuarioId) throw new Error("Usuario ID é obrigatório");

  const response = await axios.patch(
    `${API_URL}/users/add-xp/${usuarioId}`,
    { xp },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
}