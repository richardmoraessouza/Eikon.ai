import type { Character, CharacterbyId, views, Tag } from "../../types/characters/characters";
import { 
  getCharacters, 
  searchCharacterById as searchCharacterByIdService,
  incrementChatViews as incrementChatViewsService, 
  createCharacterService,
  updateCharacterService,
  // --- IMPORTED NEW SERVICES ---
  fetchTagsService,
  fetchCharactersByCategoryService,
} from "../../services/characters/characters";
import { useEffect, useState, useCallback } from "react";

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load standard explore feed on mount
  useEffect(() => {
    async function loadCharacters() {
      try {
        setLoading(true);
        setError(null);

        const data = await getCharacters();
        setCharacters(data);
      } catch (error) {
        console.error("Error loading characters:", error);
        setError("Error loading characters");
      } finally {
        setLoading(false);
      }
    }

    loadCharacters();
  }, []);

  const searchCharacterById = useCallback(async (
    personagemId: number
  ): Promise<CharacterbyId> => {
    return await searchCharacterByIdService(personagemId);
  }, []);

  const incrementChatViews = useCallback(async (
    personagemId: number | null, 
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

  // Create character
  const createCharacter = useCallback(async (usuarioId: number, payload: any, token: string) => {
      return await createCharacterService(usuarioId, payload, token);
  }, []);

  // Update character
  const updateCharacter = useCallback(async (personagemId: number, payload: any, token: string) => {
      return await updateCharacterService(personagemId, payload, token);
  }, []);

  // --- ADDED: NEW CATEGORY/TAG METHODS USING USECALLBACK ---

  /**
   * Fetches available category tags from the database
   */
  const loadTags = useCallback(async (): Promise<Tag[]> => {
    return await fetchTagsService();
  }, []);

  /**
   * Dynamically fetches characters filtering by category slug (Handles limit and offset for infinite scroll)
   */
  const loadCharactersByCategory = useCallback(async (
    slug: string, 
    limit = 20, 
    offset = 0
  ): Promise<Character[]> => {
    return await fetchCharactersByCategoryService(slug, limit, offset);
  }, []);

  return {
    characters, // Keep standard explore characters array
    loading,
    error,
    searchCharacterById,
    incrementChatViews, 
    createCharacter,
    updateCharacter,
    // --- EXPORTED NEW METHODS ---
    loadTags,
    loadCharactersByCategory
  };
}