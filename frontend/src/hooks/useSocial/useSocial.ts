import { useState, useEffect } from "react";
import { SearchFavoritesUser, SearchLikesUser, SearchQuantityLikes, toggleFavorite, toggleLike, getSeguidoresService, getSeguindoService } from "../../services/socialService";
import { useAuth } from "../AuthContext/AuthContext";
import type { SocialContextType, Seguidor } from "../../types/social/social";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../utils/frame";

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

    const wasLiked = likes.includes(personagemId);
    setLikes(prev =>
      wasLiked ? prev.filter(id => id !== personagemId) : [...prev, personagemId]
    );

    try {
      await toggleLike(userId, personagemId, token);
      setError(null);
    } catch (err: any) {
      setLikes(prev =>
        wasLiked ? [...prev, personagemId] : prev.filter(id => id !== personagemId)
      );
      console.error('[useSocial] Erro ao fazer toggle like:', err);
      setError(err?.message || 'Erro ao fazer like');
      throw err;
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
      return quantity ?? 0;
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

export function useSeguir(usuarioId: number | null, token: string | null) {
  const [seguidores, setSeguidores] = useState<Seguidor[]>([]);
  const [seguindo, setSeguindo] = useState<Seguidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usuarioId || !token) return;
    
    const idValido = usuarioId;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [seg, segInd] = await Promise.all([
          getSeguidoresService(idValido),
          getSeguindoService(idValido),
        ]);
        setSeguidores(seg);
        setSeguindo(segInd);
      } catch (err: any) {
        console.error("Erro ao carregar seguidores:", err);
        setError(err?.message || "Erro ao carregar seguidores");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [usuarioId, token]);

  useEffect(() => {
    const handler = (event: Event) => {
      const { usuarioId: updatedId, frame } = (event as CustomEvent<FrameUpdatedDetail>).detail;

      setSeguidores(prev =>
        prev.map(user => (user.id === updatedId ? { ...user, frame } : user))
      );
      setSeguindo(prev =>
        prev.map(user => (user.id === updatedId ? { ...user, frame } : user))
      );
    };

    window.addEventListener(FRAME_UPDATED_EVENT, handler);
    return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
  }, []);

  return { seguidores, seguindo, loading, error };
}