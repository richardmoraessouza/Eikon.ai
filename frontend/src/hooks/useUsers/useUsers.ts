import { useEffect, useState } from "react";
import type { creatorName } from "../../types/users/users";
import { searchCreatorName } from "../../services/users/userService";

export function useUsers(usuarioId: number) {
    const [users, setUsers] = useState<creatorName[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // search for the name of the character's creator
    useEffect(() => {
        if (!usuarioId) return;
        
        async function loadNameUser() {
            setLoading(true);
            setError(null);
            try {
                const data = await searchCreatorName(usuarioId); // Usa o parâmetro
                setUsers([data]);
            } catch (err: any) {
                console.error('Error loading name user:', err);
                setError(err?.message || 'Error loading name user');
            } finally {
                setLoading(false);
            }
        }

        loadNameUser();
    }, [usuarioId]);
 
    return { users, loading, error };
}