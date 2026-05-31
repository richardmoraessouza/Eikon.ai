import type { Character, CharacterbyId, views } from "../../types/characters/characters";
import { 
  getCharacters, 
  searchCharacterById as searchCharacterByIdService,
  incrementChatViews as incrementChatViewsService, 
  createCharacterService,
  updateCharacterService
} from "../../services/characters/characters";
import { useEffect, useState, useCallback } from "react"; // Adicionado useCallback aqui

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    characters,
    loading,
    error,
    searchCharacterById,
    incrementChatViews, 
    createCharacter,
    updateCharacter
  };
}