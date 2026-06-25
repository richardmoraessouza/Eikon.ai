import { useState, useEffect } from "react";
import { buscarPersonagens } from "../../services/personagemService";
import type { Character } from "../../types/characters/characters";

export function useExplore() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const data = await buscarPersonagens();
                setCharacters(data);
            } catch (err) {
                console.error('Error loading explore data:', err);
                setError('Error loading explore data');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return { characters, loading, error };
}
