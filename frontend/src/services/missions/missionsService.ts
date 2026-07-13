import axios from "axios";
import { API_URL } from "../../config/api";
import type { DailyMission, ProgressResponse } from "../../types/missions/missions";

function getAuthHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isAuthError(error: unknown) {
  return axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0);
}

// Busca as 5 missões diárias do usuário (ou força o sorteio no back-end)
export async function getDailyMissions(usuarioId: number, token?: string): Promise<DailyMission[]> {
  if (!usuarioId) return [];

  try {
    const res = await axios.get<DailyMission[]>(`${API_URL}/missions/daily/${usuarioId}`, {
      headers: getAuthHeaders(token),
    });
    return res.data;
  } catch (err) {
    if (!isAuthError(err)) {
      console.error("Error searching daily missions:", err);
    }
    return [];
  }
}

// Atualiza ou incrementa o progresso de uma missão no banco
export async function updateMissionProgress(
  usuarioId: number,
  missionId: number,
  incremento: number = 1,
  token?: string
): Promise<ProgressResponse> {
  try {
    const res = await axios.post<ProgressResponse>(`${API_URL}/missions/progress`, {
      usuarioId,
      missionId,
      incremento,
    }, {
      headers: getAuthHeaders(token),
    });
    return res.data;
  } catch (err) {
    console.error("Error updating mission progress:", err);
    throw err;
  }
}

// search user level by ID
export async function getUserLevelService(usuarioId: number, token?: string): Promise<number> {
    if (!usuarioId) return 1;

    try {
        const response = await axios.get(`${API_URL}/users/level-user/${usuarioId}`, {
          headers: getAuthHeaders(token),
        });
        return response.data.nivel ?? 1;
    } catch (error: any) {
        if (!isAuthError(error)) {
            console.error(`Error fetching user level`, error.response?.data);
        }
        return 1;
    }
}

// Search user xp by ID
export async function getUserXpService(usuarioId: number, token?: string): Promise<number> {
    if (!usuarioId) return 0;

    try {
        const response = await axios.get(`${API_URL}/users/xp-user/${usuarioId}`, {
          headers: getAuthHeaders(token),
        });
        return response.data.xp ?? 0;
    } catch (error: any) {
        if (!isAuthError(error)) {
            console.error(`Error fetching user XP`, error.response?.data);
        }
        return 0;
    }
}

// Claim a mission reward by missionId. The server validates ownership and awards XP.
export async function claimMissionService(
  missionId: number,
  token?: string
): Promise<{ xp_awarded?: number; updated?: any }>{
  try {
    const res = await axios.post(`${API_URL}/missions/claim/${missionId}`, null, {
      headers: getAuthHeaders(token),
    });
    return res.data;
  } catch (err) {
    console.error('Error claiming mission', err);
    throw err;
  }
}