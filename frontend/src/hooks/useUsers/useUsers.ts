import { useEffect, useState, useCallback } from "react";
import type { User } from "../../types/users/users";
import { searchCreatorNameService, updateUserService } from "../../services/users/userService";

export function useUsers(usuarioId: number | null) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Busca os dados do criador do personagem
    useEffect(() => {
        if (usuarioId === null || usuarioId === undefined) return;
        
        async function loadNameUser() {
            setLoading(true);
            setError(null);
            try {
                const data = await searchCreatorNameService(usuarioId);
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

    const updateCharacter = useCallback(async (id: number, token: string, userData: { nome: string; foto_perfil?: string; descricao?: string }) => {
        return await updateUserService(id, token, userData);
    }, []);

    return { users, loading, error, updateCharacter };
}