import { useEffect, useState, useCallback, useRef } from "react";
import type { Character } from "../../types/characters/characters";
import { getCharactersPaginated } from "../../services/characters/characters";

const EXPLORE_LIMIT = 20;
// Gerada uma vez por sessão do app (enquanto a página não recarrega).
// Mantém a mesma ordem "aleatória" ao navegar entre rotas/abas,
// mas varia a cada nova sessão/refresh.
const EXPLORE_SEED = Math.random();

export function useExploreCharacters() {
  const [exploreCharacters, setExploreCharacters] = useState<Character[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [exploreOffset, setExploreOffset] = useState(0);
  const [exploreHasMore, setExploreHasMore] = useState(true);
  const exploreLoadingRef = useRef(false);

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

  useEffect(() => {
    loadMoreExplore();
  }, []);

  return {
    exploreCharacters,
    exploreLoading,
    exploreError,
    exploreHasMore,
    loadMoreExplore,
  };
}