// hooks/characters/useProfileCharacters.tsx
import type { Character } from "../../types/characters/characters";
import type { Favorite } from "../../types/social/social";
import {
  getCharactersByUserId,
  getRecentCharacters,
} from "../../services/characters/characters";
import { SearchFavoritesUser } from "../../services/social/socialService";
import { useEffect, useState, useCallback } from "react";

export type ProfileCharacterType = "meus-personagens" | "favoritos" | "recentes";

export interface ProfileCharacter extends Character {
  tipo_personagem?: string;
}

function normalizeFavorites(favData: number[] | Favorite[]): ProfileCharacter[] {
  if (!Array.isArray(favData)) return [];
  return favData.map(item =>
    typeof item === "number" ? ({ id: item } as ProfileCharacter) : (item as ProfileCharacter)
  );
}

export function useProfileCharacters(
  type: ProfileCharacterType,
  usuarioId: number | null,
  abaAtiva?: string
) {
  const [characters, setCharacters] = useState<ProfileCharacter[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!usuarioId) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let data: ProfileCharacter[] = [];

      if (type === "meus-personagens") {
        data = await getCharactersByUserId(usuarioId);
      } else if (type === "favoritos") {
        const favData = await SearchFavoritesUser(usuarioId);
        data = normalizeFavorites(favData);
      } else {
        data = await getRecentCharacters(usuarioId);
      }

      setCharacters(data);
    } catch (err) {
      console.error(`Erro ao carregar ${type}:`, err);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [type, usuarioId]);

  useEffect(() => {
    load();
  }, [load, abaAtiva]);

  useEffect(() => {
    if (type !== "favoritos" || !usuarioId) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favoritos_updated") {
        setTimeout(() => load(), 300);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [type, usuarioId, load]);

  const removeCharacter = useCallback((characterId: number) => {
    setCharacters(prev => prev.filter(c => c.id !== characterId));
  }, []);

  return { characters, loading, load, removeCharacter };
}