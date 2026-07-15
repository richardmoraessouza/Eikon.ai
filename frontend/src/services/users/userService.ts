import axios from "axios";
import { API_URL } from "../../config/api";
import type { User, UpdateUserResponse, MiniProfileType } from "../../types/users/users";
import { normalizeFrame } from "../../utils/frame";

// search for the name of the character's creator
export async function searchCreatorNameService(usuarioId: number | null, token?: string): Promise<User> {
    if (!usuarioId) {
        throw new Error('Usuario ID é obrigatório');
    }

    try {
        const url = token
            ? `${API_URL}/users/user/${usuarioId}`
            : `${API_URL}/users/name-user/${usuarioId}`;

        const response = await axios.get(url, {
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : undefined,
        });

        const data = response.data;
        return {
            ...data,
            frame: normalizeFrame(data.frame),
        };
    } catch (error) {
        console.error(`Error searching creator name for ${usuarioId}:`, error);
        throw error;
    }
}

// update profile user
export async function updateUserService(
    usuarioId: number,
    userData: { nome?: string; foto_perfil?: string; descricao?: string; username?: string; hide_favorite_character?: boolean; hide_recent_character?: boolean; hide_followers?: boolean; hide_following?: boolean },
    token?: string | null,
): Promise<UpdateUserResponse> {
    try {
        const response = await axios.put(`${API_URL}/users/edit-profile/${usuarioId}`, userData, {
            withCredentials: true,
            headers: token ? {
                Authorization: `Bearer ${token}`
            } : undefined,
        });
        return response.data;
    } catch (error) {
         console.error('Error updating user:', error);
         throw error;
    }
}

// Shows user data in mini profile
export async function getMiniProfileService(usuarioId: number): Promise<MiniProfileType> {
  if (!usuarioId) {
    throw new Error('Usuario ID é obrigatório');
  }

  try {
    const response = await axios.get(`${API_URL}/users/mini-profile/${usuarioId}`);
    const d = response.data;

    return {
        usuarioId: d.id,
        nome:      d.nome,
        foto:      d.foto_perfil,
        descricao: d.descricao,
        username:  d.username ?? null,
        frame:     normalizeFrame(d.frame),
        is_online: d.is_online,
        nivel:     d.nivel ?? null,
        unlocked_frames: Array.isArray(d.unlocked_frames) ? d.unlocked_frames : [],
    };
  } catch (error) {
    console.error(`Error loading mini profile data for user ${usuarioId}:`, error);
    throw error;
  }
}

// Update user frame
export async function updateFrameService (usuarioId: number, frame: string, token?: string): Promise<User & { unlocked_frames?: string[] }> {
    try {
        const res = await axios.put(`${API_URL}/users/update-frame/${usuarioId}`, { frame }, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return {
            ...res.data,
            frame: normalizeFrame(res.data?.frame ?? frame),
            unlocked_frames: Array.isArray(res.data?.unlocked_frames) ? res.data.unlocked_frames : [],
        };

    } catch (error: any) {
        console.error(`Error updating frame:`, error.response?.data);
        throw error;
    }
}