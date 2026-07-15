import { useState, useEffect } from "react";
import { SearchFavoritesUser, SearchLikesUser, SearchQuantityLikes, toggleFavorite, toggleLike, getSeguidoresService, getSeguindoService } from "../../services/social/socialService";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import type { SocialContextType, Seguidor } from "../../types/social/social";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../utils/frame";

function normalizeIdentifier(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const publicId = record.public_id;
    if (typeof publicId === 'string' && publicId.trim()) return publicId;
  }
  return null;
}

export function useSocial(): SocialContextType {
  const { usuarioId: userId, token } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
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
          ? favs
              .map((item) => normalizeIdentifier(item))
              .filter((value): value is string => Boolean(value))
          : [];

        const normalizedLikes = Array.isArray(likesData)
          ? likesData
              .map((item) => normalizeIdentifier(item))
              .filter((value): value is string => Boolean(value))
          : [];

        setFavorites(favoritesIds);
        setLikes(normalizedLikes);
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
  const handleToggleLike = async (personagemId: string): Promise<void> => {
    if (!userId) {
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
  const handleToggleFavorite = async (personagemId: string): Promise<void> => {
    if (!userId) {
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
  const getQuantityLikes = async (personagemId: string): Promise<number> => {
    if (!personagemId || typeof personagemId !== 'string' || !personagemId.trim()) {
      console.warn('[useSocial] getQuantityLikes chamado com personagemId inválido:', personagemId);
      return 0;
    }

    try {
      const quantity = await SearchQuantityLikes(personagemId);
      return quantity ?? 0;
    } catch (err: any) {
      console.error('[useSocial] Erro ao buscar quantidade de likes:', err);
      return 0;
    }
  };

  // Verificadores
  const isFavorite = (id: string): boolean => favorites.includes(id);
  const isLiked = (id: string): boolean => likes.includes(id);

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
    if (!usuarioId) return;
    
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