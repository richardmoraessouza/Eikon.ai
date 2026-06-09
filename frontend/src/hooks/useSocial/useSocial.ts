import { useState, useEffect } from "react";
import { SearchFavoritesUser, SearchLikesUser, SearchQuantityLikes, toggleFavorite, toggleLike } from "../../services/socialService";
import { useAuth } from "../AuthContext/AuthContext";
import type { SocialContextType } from "../../types/social/social";

export function useSocial(): SocialContextType {
  const { usuarioId: userId, token } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search favorites and likes of the user when the component mounts or when user/token changes
  useEffect(() => {
    if (!userId) return;

    const fetchSocialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [favs, likesData] = await Promise.all([
          SearchFavoritesUser(userId),
          SearchLikesUser(userId, token || undefined)
        ]);
        
        // Processar favoritos para extrair apenas IDs
        const favoritesIds = Array.isArray(favs) 
          ? favs.map(f => typeof f === 'object' ? f.id : f) 
          : [];
          
        setFavorites(favoritesIds);
        setLikes(likesData);
      } catch (err: any) {
        console.error('[useSocial] Erro ao buscar dados sociais:', err);
        setError(err?.message || 'Erro ao buscar dados sociais');
      } finally {
        setLoading(false);
      }
    };

    fetchSocialData();
  }, [userId, token]);

  // Toggle like
  const handleToggleLike = async (personagemId: number): Promise<void> => {
    if (!userId || !token) {
      setError('Usuário não autenticado');
      return;
    }
    try {
      await toggleLike(userId, personagemId, token);
      setLikes(prev => 
        prev.includes(personagemId) 
          ? prev.filter(id => id !== personagemId)
          : [...prev, personagemId]
      );
      setError(null);
    } catch (err: any) {
      console.error('[useSocial] Erro ao fazer toggle like:', err);
      setError(err?.message || 'Erro ao fazer like');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (personagemId: number): Promise<void> => {
    if (!userId || !token) {
      setError('Usuário não autenticado');
      return;
    }
    try {
      await toggleFavorite(userId, personagemId, token);
      setFavorites(prev => 
        prev.includes(personagemId) 
          ? prev.filter(id => id !== personagemId)
          : [...prev, personagemId]
      );
      setError(null);
    } catch (err: any) {
      console.error('[useSocial] Erro ao fazer toggle favorite:', err);
      setError(err?.message || 'Erro ao adicionar aos favoritos');
    }
  };

  // Get quantity of likes for a character
  const getQuantityLikes = async (personagemId: number): Promise<number> => {
    try {
      const quantity = await SearchQuantityLikes(personagemId);
      return quantity;
    } catch (err: any) {
      console.error('[useSocial] Erro ao buscar quantidade de likes:', err);
      return 0;
    }
  };

  // Verificadores
  const isFavorite = (id: number): boolean => favorites.includes(id);
  const isLiked = (id: number): boolean => likes.includes(id);

  return {
    favorites,
    likes,
    loading,
    error,
    handleToggleLike,
    handleToggleFavorite,
    getQuantityLikes,
    isFavorite,
    isLiked
  };
}
