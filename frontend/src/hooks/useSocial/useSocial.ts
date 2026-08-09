import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

export function useSocial(): SocialContextType {
  const router = useRouter();
  const { usuarioId: userId, token, estaLogado } = useAuth();
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
      } catch (error: unknown) {
        console.error('[useSocial] Erro ao buscar dados sociais:', error);
        setError(getErrorMessage(error, 'Erro ao buscar dados sociais'));
      } finally {
        setLoading(false);
      }
    };

    fetchSocialData();
  }, [userId, token]);

  // Toggle like
  const handleToggleLike = async (personagemId: string): Promise<void> => {
    if (!estaLogado || !userId) {
      setError('Usuário não autenticado');
      router.push('/login');
      return;
    }

    const wasLiked = likes.includes(personagemId);
    setLikes(prev =>
      wasLiked ? prev.filter(id => id !== personagemId) : [...prev, personagemId]
    );

    try {
      await toggleLike(userId, personagemId, token);
      setError(null);
    } catch (error: unknown) {
      setLikes(prev =>
        wasLiked ? [...prev, personagemId] : prev.filter(id => id !== personagemId)
      );
      console.error('[useSocial] Erro ao fazer toggle like:', error);
      setError(getErrorMessage(error, 'Erro ao fazer like'));
      throw error;
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (personagemId: string): Promise<void> => {
    if (!estaLogado || !userId) {
      setError('Usuário não autenticado');
      router.push('/login');
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
    } catch (error: unknown) {
      console.error('[useSocial] Erro ao fazer toggle favorite:', error);
      setError(getErrorMessage(error, 'Erro ao adicionar aos favoritos'));
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
    } catch (error: unknown) {
      console.error('[useSocial] Erro ao buscar quantidade de likes:', error);
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
      } catch (error: unknown) {
        console.error("Erro ao carregar seguidores:", error);
        setError(getErrorMessage(error, "Erro ao carregar seguidores"));
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