// hooks/characters/useCharacters.tsx
import type { CharacterbyId, Character, views, Tag, RecentCharacter } from "../../types/characters/characters";
import {
  searchCharacterById as searchCharacterByIdService,
  incrementChatViews as incrementChatViewsService,
  createCharacterService,
  updateCharacterService,
  fetchTagsService,
  fetchCharactersByCategoryService,
  recentCharactersService,
  updateCharacterVisibilityService
} from "../../services/characters/characters";
import { useCallback } from "react";
import { useCharacterSearch } from "./useCharacterSearch";

export function useCharacters() {
  const {
    searchResults,
    searchLoading,
    searchError,
    searchHasMore,
    searchCharacterByName,
    setSearchResults,
    seedSearchResults,
    loadMoreSearchResults,
  } = useCharacterSearch();

  // Fetches a single character's full data by ID
  const searchCharacterById = useCallback(async (
    personagemId: string | number
  ): Promise<CharacterbyId> => {
    return await searchCharacterByIdService(personagemId);
  }, []);

  // Increments the chat view count for a character — requires a valid token
  const incrementChatViews = useCallback(async (
    personagemId: string | number | null,
    token: string | null
  ): Promise<views | null> => {
    if (personagemId === null || !token) return null;
    try {
      const data = await incrementChatViewsService(personagemId, token);
      return data;
    } catch (err) {
      console.error("Error incrementing chat views:", err);
      return null;
    }
  }, []);

  // Sends a request to create a new character under the given user ID
  const createCharacter = useCallback(async (usuarioId: number, payload: any, token?: string | null) => {
    return await createCharacterService(usuarioId, payload, token);
  }, []);

  // Sends a request to update an existing character by ID
  const updateCharacter = useCallback(async (personagemId: number, payload: any, token?: string | null) => {
    return await updateCharacterService(personagemId, payload, token);
  }, []);

  // Fetches all available category tags for the filter UI
  const loadTags = useCallback(async (): Promise<Tag[]> => {
    return await fetchTagsService();
  }, []);

  // Fetches characters filtered by a category slug with pagination support
  const loadCharactersByCategory = useCallback(async (
    slug: string,
    limit = 20,
    offset = 0
  ): Promise<Character[]> => {
    return await fetchCharactersByCategoryService(slug, limit, offset);
  }, []);

  // search for characters recently accessed by the user, ordered by most recent
  const recentCharacters = useCallback(async (
    usuarioId: number,
    personagemId: string | number
  ): Promise<RecentCharacter | null> => {
    try {
      return await recentCharactersService(usuarioId, personagemId);
    } catch (err) {
      console.error('Erro ao registrar personagem recente:', err);
      return null;
    }
  }, []);

  const updateVisibility = useCallback(
    async (
      publicId: string,
      isPublic: boolean,
      token?: string | null
    ) => {
      try {
        const data = await updateCharacterVisibilityService(
          publicId,
          isPublic,
          token
        );

        console.log(
          `Bot ${data.nome} agora está ${
            data.is_public ? "Público" : "Privado"
          }`
        );

        return data;
      } catch (error) {
        console.error(
          "Falha ao atualizar visibilidade do personagem:",
          error
        );
        throw error;
      }
    },
    []
  );

  return {
    searchCharacterById,
    incrementChatViews,
    createCharacter,
    updateCharacter,
    loadTags,
    loadCharactersByCategory,
    recentCharacters,
    updateVisibility,
    searchResults,
    searchLoading,
    searchError,
    searchHasMore,
    searchCharacterByName,
    setSearchResults,
    seedSearchResults,
    loadMoreSearchResults,
  };
}