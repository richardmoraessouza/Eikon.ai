// hooks/characters/useCharacterSearch.tsx
import type { Character } from "../../types/characters/characters";
import { searchCharacterByNameService } from "../../services/characters/characters";
import { useState, useCallback, useRef } from "react";

const SEARCH_LIMIT = 20;

export function useCharacterSearch() {
  // Holds the list of characters found during the name-based search
  const [searchResults, setSearchResults] = useState<Character[]>([]);

  // True while a name-based search request is actively fetching data
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Holds any error message resulting from a failed name-based search
  const [searchError, setSearchError] = useState<string | null>(null);

  const [searchOffset, setSearchOffset] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const searchLoadingRef = useRef(false);
  const lastSearchParamsRef = useRef<{ nome: string; tag: string }>({ nome: '', tag: '' });

  // Fetches a list of characters matching a specific name from the service
  const searchCharacterByName = useCallback(async (
    nomePersonagem: string,
    tag = ''
  ): Promise<Character[]> => {
    setSearchLoading(true);
    setSearchError(null);
    lastSearchParamsRef.current = { nome: nomePersonagem, tag };
    try {
      const resultados = await searchCharacterByNameService(nomePersonagem, tag, SEARCH_LIMIT, 0);
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
      const novos = await searchCharacterByNameService(nome, tag, SEARCH_LIMIT, searchOffset);
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