import { useState, useEffect } from "react";
import { getPopularWeek } from "../../services/discovery/discoveryService";
import type { PopularCharacter } from "../../types/discovery/discovery";
import type { Character } from "../../types/characters/characters";
import { recommendationsByWeight } from "../../services/discovery/discoveryService";

// Search characters most popular of the week
export function useDiscovery() {
    const [characters, setCharacters] = useState<PopularCharacter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const data = await getPopularWeek();
                setCharacters(data);
            } catch (err) {
                console.error('Error loading popular week data:', err);
                setError('Error loading popular week data');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return { characters, loading, error };
}


export function useRecommendations(usuarioId: number) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // Reseta o estado se o usuário logado mudar
    useEffect(() => {
        setCharacters([]);
        setPage(1);
        setHasMore(true);
    }, [usuarioId]);

    useEffect(() => {
        if (!usuarioId || isNaN(usuarioId) || usuarioId === 0) return;

        async function loadRecommendations() {
            try {
                setLoading(true);
                setError(null);
                
                // Passa o ID do usuário e a página atual para a API
                const newData = await recommendationsByWeight(usuarioId, page);
                
                if (newData.length === 0) {
                    setHasMore(false);
                    return;
                }

                // Alimenta a lista concatenando os personagens antigos com os novos
                setCharacters(prev => {
                    // Evita duplicados caso o useEffect rode duas vezes no StrictMode
                    const existingIds = new Set(prev.map(c => c.id));
                    const uniqueNewData = newData.filter(c => !existingIds.has(c.id));
                    return [...prev, ...uniqueNewData];
                });
                
                if (newData.length < 20) {
                    setHasMore(false);
                }
            } catch (err) {
                console.error('Error loading recommendations:', err);
                setError('Erro ao carregar recomendações.');
            } finally {
                setLoading(false);
            }
        }

        loadRecommendations();
    }, [usuarioId, page]);

    const fetchNextPage = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };
    
    return { characters, loading, error, hasMore, fetchNextPage };
}