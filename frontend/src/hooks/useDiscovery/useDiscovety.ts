import { useState, useEffect } from "react";
import { getPopularWeek } from "../../services/discoveryService";
import type { PopularCharacter } from "../../types/discovery";

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