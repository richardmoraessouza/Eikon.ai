import React, { createContext, useState, useContext, type ReactNode, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';

type Personagem = {
    id: number;
    fotoia: string;
    nome: string;
};

interface FavoritesContextType {
    favoritos: Personagem[];
    loading: boolean;
    adicionarFavorito: (personagem: Personagem) => void;
    removerFavorito: (personagemId: number) => void;
    recarregarFavoritos: (usuarioId: number, token: string) => Promise<void>;
    isFavorito: (personagemId: number) => boolean;
}

const initialContextValue: FavoritesContextType = {
    favoritos: [],
    loading: false,
    adicionarFavorito: () => {},
    removerFavorito: () => {},
    recarregarFavoritos: async () => {},
    isFavorito: () => false,
};

const FavoritesContext = createContext<FavoritesContextType>(initialContextValue);

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
    const [favoritos, setFavoritos] = useState<Personagem[]>([]);
    const [loading, setLoading] = useState(false);
    const [usuarioAtual, setUsuarioAtual] = useState<number | null>(null);
    const [tokenAtual, setTokenAtual] = useState<string | null>(null);

    // Função para recarregar favoritos do backend
    const recarregarFavoritos = useCallback(async (usuarioId: number, token: string) => {
        if (!usuarioId || !token) {
            setFavoritos([]);
            return;
        }

        setUsuarioAtual(usuarioId);
        setTokenAtual(token);
        setLoading(true);
        
        try {
            const res = await axios.get(`${API_URL}/social/favorites-by-user/${usuarioId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = Array.isArray(res.data) ? res.data : [];
            setFavoritos(data);
        } catch (err) {
            console.error("Erro ao carregar favoritos:", err);
            setFavoritos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Adicionar favorito localmente
    const adicionarFavorito = useCallback((personagem: Personagem) => {
        setFavoritos((prev) => {
            // Verifica se já não existe
            if (prev.find(p => p.id === personagem.id)) {
                return prev;
            }
            return [...prev, personagem];
        });
    }, []);

    // Remover favorito localmente
    const removerFavorito = useCallback((personagemId: number) => {
        setFavoritos((prev) => prev.filter(p => p.id !== personagemId));
    }, []);

    // Verificar se um personagem é favorito
    const isFavorito = useCallback((personagemId: number) => {
        return favoritos.some(p => p.id === personagemId);
    }, [favoritos]);

    // Ouvir eventos de sincronização entre abas/janelas
    useEffect(() => {
        const handleStorageChange = async (e: StorageEvent) => {
            if (e.key === 'favoritos_updated' && usuarioAtual && tokenAtual) {
                // Aguardar um pouco para garantir que o backend foi atualizado
                setTimeout(() => {
                    recarregarFavoritos(usuarioAtual, tokenAtual);
                }, 300);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [usuarioAtual, tokenAtual, recarregarFavoritos]);

    const contextValue: FavoritesContextType = {
        favoritos,
        loading,
        adicionarFavorito,
        removerFavorito,
        recarregarFavoritos,
        isFavorito,
    };

    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
