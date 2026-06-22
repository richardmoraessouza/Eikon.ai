import type { Character, CharacterbyId, views, Tag, RecentCharacter } from "../../types/characters/characters";
import type { Favorite } from "../../types/social/social";
import {
  getCharactersPaginated,
  searchCharacterById as searchCharacterByIdService,
  incrementChatViews as incrementChatViewsService,
  createCharacterService,
  updateCharacterService,
  fetchTagsService,
  fetchCharactersByCategoryService,
  getCharactersByUserId,
  getRecentCharacters,
  recentCharactersService,
  searchCharacterByNameService
} from "../../services/characters/characters";
import { SearchFavoritesUser } from "../../services/socialService";
import { useEffect, useState, useCallback, useRef } from "react";

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

const EXPLORE_LIMIT = 20;
const EXPLORE_SEED = Math.random();
const SEARCH_LIMIT = 20;

export function useCharacters() {

 // Holds the list of characters found during the name-based search
  const [searchResults, setSearchResults] = useState<Character[]>([]);

  // True while a name-based search request is actively fetching data
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Holds any error message resulting from a failed name-based search
  const [searchError, setSearchError] = useState<string | null>(null);

  // Stores the list of characters loaded for the Explore feed (paginated)
  const [exploreCharacters, setExploreCharacters] = useState<Character[]>([]);

  // True while a paginated request is in flight
  const [exploreLoading, setExploreLoading] = useState(false);

  // Holds any error message from a failed explore fetch
  const [exploreError, setExploreError] = useState<string | null>(null);

  // Tracks how many characters have been fetched so far (used as SQL OFFSET)
  const [exploreOffset, setExploreOffset] = useState(0);

  // False when the last page returned fewer items than EXPLORE_LIMIT — no more pages
  const [exploreHasMore, setExploreHasMore] = useState(true);

  // Ref-based guard to prevent duplicate in-flight requests (avoids race conditions)
  const exploreLoadingRef = useRef(false);


  const [searchOffset, setSearchOffset] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const searchLoadingRef = useRef(false);
  const lastSearchParamsRef = useRef<{ nome: string; tag: string }>({ nome: '', tag: '' });


  // Fetches the next page of explore characters and appends them to the list
  const loadMoreExplore = useCallback(async () => {
    if (exploreLoadingRef.current || !exploreHasMore) return;
    exploreLoadingRef.current = true;
    setExploreLoading(true);
    try {
      setExploreError(null);
      const data = await getCharactersPaginated(EXPLORE_LIMIT, exploreOffset, EXPLORE_SEED);
      if (data.length < EXPLORE_LIMIT) setExploreHasMore(false);
      setExploreCharacters(prev => [...prev, ...data]);
      setExploreOffset(prev => prev + EXPLORE_LIMIT);
    } catch (err) {
      console.error('Error loading explore data:', err);
      setExploreError('Erro ao carregar personagens.');
    } finally {
      setExploreLoading(false);
      exploreLoadingRef.current = false;
    }
  }, [exploreOffset, exploreHasMore]);

  // Loads the first page on mount
  useEffect(() => {
    loadMoreExplore();
  }, []);

  // Fetches a single character's full data by ID
  const searchCharacterById = useCallback(async (
    personagemId: number
  ): Promise<CharacterbyId> => {
    return await searchCharacterByIdService(personagemId);
  }, []);

  // Increments the chat view count for a character — requires a valid token
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

  // Sends a request to create a new character under the given user ID
  const createCharacter = useCallback(async (usuarioId: number, payload: any, token: string) => {
    return await createCharacterService(usuarioId, payload, token);
  }, []);

  // Sends a request to update an existing character by ID
  const updateCharacter = useCallback(async (personagemId: number, payload: any, token: string) => {
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
  personagemId: number
  ): Promise<RecentCharacter | null> => {
    try {
      return await recentCharactersService(usuarioId, personagemId);
    } catch (err) {
      console.error('Erro ao registrar personagem recente:', err);
      return null;
    }
  }, []);

  // Fetches a list of characters matching a specific name from the service
   const searchCharacterByName = useCallback(async (
    nomePersonagem: string,
    tag = ''
  ): Promise<Character[]> => {
    setSearchLoading(true);
    setSearchError(null);
    lastSearchParamsRef.current = { nome: nomePersonagem, tag };
    try {
      const data = await searchCharacterByNameService(nomePersonagem, tag, SEARCH_LIMIT, 0);
      const resultados = data.resultados ?? [];
      setSearchResults(resultados);
      setSearchOffset(SEARCH_LIMIT);
      setSearchHasMore(resultados.length === SEARCH_LIMIT);
      return resultados;
    } catch (err) {
      console.error('Erro ao buscar personagem por nome:', err);
      setSearchError('Erro ao buscar personagens.');
      setSearchResults([]);
      setSearchHasMore(false);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Fetches the next page of search results for the current name/tag query and appends them
  // to the existing list (infinite scroll). Uses lastSearchParamsRef to know which name/tag
  // to keep querying, and searchLoadingRef as a guard against duplicate in-flight requests.
    const loadMoreSearchResults = useCallback(async () => {
    const { nome, tag } = lastSearchParamsRef.current;
    if (searchLoadingRef.current || !searchHasMore || !nome) return;

    searchLoadingRef.current = true;
    setSearchLoading(true);
    try {
      const data = await searchCharacterByNameService(nome, tag, SEARCH_LIMIT, searchOffset);
      const novos = data.resultados ?? [];
      setSearchResults(prev => [...prev, ...novos]);
      setSearchOffset(prev => prev + SEARCH_LIMIT);
      if (novos.length < SEARCH_LIMIT) setSearchHasMore(false);
    } catch (err) {
      console.error('Erro ao carregar mais personagens:', err);
      setSearchError('Erro ao buscar personagens.');
    } finally {
      setSearchLoading(false);
      searchLoadingRef.current = false;
    }
  }, [searchOffset, searchHasMore]);

  // Seeds the search state with results that arrived ready-made from another page
  // (e.g. Home / Sidebar navigation via location.state), instead of fetching from the API.
  // Also resets pagination based on the seeded data, so loadMoreSearchResults works correctly afterwards.
  const seedSearchResults = useCallback((resultados: Character[], nome: string, tag: string = '') => {
    setSearchResults(resultados);
    setSearchOffset(resultados.length);
    setSearchHasMore(resultados.length >= SEARCH_LIMIT);
    lastSearchParamsRef.current = { nome, tag };
  }, []);


  return {
    // Explore feed data and pagination controls
    exploreCharacters,
    exploreLoading,
    exploreError,
    exploreHasMore,
    loadMoreExplore,
    
    // Core character management actions and filters
    searchCharacterById,
    incrementChatViews,
    createCharacter,
    updateCharacter,
    loadTags,
    loadCharactersByCategory,
    recentCharacters,

    // State and functions for character name-based searching
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

