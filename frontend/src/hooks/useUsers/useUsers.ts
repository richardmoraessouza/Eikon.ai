import { useEffect, useState, useCallback } from "react";
import type { User } from "../../types/users/users";
import {
  searchCreatorNameService,
  updateUserService,
  getMiniProfileService,
  updateFrameService,
} from "../../services/users/userService";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../utils/frame";

export function useUsers(usuarioId: number | null) {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Fetch the character creator's data when usuarioId changes
  useEffect(() => {
    if (usuarioId === null || usuarioId === undefined) return;

    async function loadNameUser() {
      setLoading(true);
      setError(null);
      try {
        const data = await searchCreatorNameService(usuarioId);
        setUsers([data]);
      } catch (err: any) {
        console.error("Error loading name user:", err);
        setError(err?.message || "Error loading name user");
      } finally {
        setLoading(false);
      }
    }

    loadNameUser();
  }, [usuarioId]);

  // Listen for frame update events and sync local state
  useEffect(() => {
    if (!usuarioId) return;

    const handler = (event: Event) => {
      const { usuarioId: updatedId, frame } = (
        event as CustomEvent<FrameUpdatedDetail>
      ).detail;

      if (updatedId !== usuarioId) return;

      setUsers((prev) =>
        prev.length > 0 ? [{ ...prev[0], frame }] : prev
      );
    };

    window.addEventListener(FRAME_UPDATED_EVENT, handler);
    return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
  }, [usuarioId]);

  // Update user profile data (name, avatar, description)
  const updateUser = useCallback(
    async (
      id: number,
      token: string,
      userData: { nome: string; foto_perfil?: string; descricao?: string; username?: string }
    ) => {
      return await updateUserService(id, token, userData);
    },
    []
  );

  // Update user profile frame
  const updateFrame = useCallback(
    async (usuarioId: number, frame: string, token?: string) => {
      return await updateFrameService(usuarioId, frame, token);
    },
    []
  );

  // Fetch user data for mini profile preview
  const getMiniProfile = useCallback(async (id: number) => {
    return await getMiniProfileService(id);
  }, []);

  return {
    users,
    loading,
    error,
    updateUser,
    getMiniProfile,
    updateFrame,
  };
}