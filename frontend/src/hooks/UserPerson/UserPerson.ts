import { useEffect, useState } from "react";
import {
  buscarPersonagensUsuario,
  buscarPersonagens,
  buscarLikesUsuario,
  buscarNomeUsuario,
  buscarFavoritosUsuario,
  buscarQuantidadeLikes,
  toggleLike,
  toggleFavorito
} from "../../services/personagemService";

/** Sempre busca TODOS os personagens (Explorar). Likes/favoritos do usuário quando logado. */
export function usePersonagensUsuario(usuarioId: number | null, token?: string | null) {
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function carregar() {
      setLoading(true);

      try {
        const listaBase = await buscarPersonagens();

        const idsCurtidos = usuarioId ? await buscarLikesUsuario(usuarioId) : [];
        const idsFavoritos = usuarioId ? await buscarFavoritosUsuario(usuarioId) : [];

        const personagensComDados = await Promise.all(
          listaBase.map(async (p: any) => {
            const qtdLikes = await buscarQuantidadeLikes(p.id);

            const existingName = p.nome_criador || p.criador || p.usuario?.nome || p.usuario_nome || p.usuarioName || p.nomeCriador;
            const creatorId = p.usuario_id ?? p.usuarioId ?? p.usuario?.id ?? p.user_id ?? p.criador_id ?? null;

            const nomeCriador = existingName
              ? existingName
              : creatorId ? await buscarNomeUsuario(creatorId) : 'IA';

            return {
              ...p,
              nome_criador: nomeCriador || 'IA',
              likes: qtdLikes,
              curtidoPeloUsuario: idsCurtidos.includes(Number(p.id)),
              favoritadoPeloUsuario: idsFavoritos.includes(Number(p.id))
            };
          })
        );

        setPersonagens(personagensComDados);
      } catch (err) {
        console.log("Erro ao carregar personagens", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [usuarioId, token]);

  async function like(personagemId: number) {
    if (!usuarioId || !token) return;

    const { liked } = await toggleLike(usuarioId, personagemId, token);

    setPersonagens(prev =>
      prev.map(p =>
        p.id === personagemId
          ? {
              ...p,
              likes: liked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 0) - 1),
              curtidoPeloUsuario: liked
            }
          : p
      )
    );
  }

  async function favorito(personagemId: number) {
    if (!usuarioId || !token) return;

    const res = await toggleFavorito(usuarioId, personagemId, token);

    const statusFavorito =
      res.favorited !== undefined ? res.favorited : res.liked;

    setPersonagens(prev =>
      prev.map(p =>
        p.id === personagemId
          ? {
              ...p,
              favoritadoPeloUsuario:
                statusFavorito !== undefined
                  ? statusFavorito
                  : !p.favoritadoPeloUsuario
            }
          : p
      )
    );
  }

  return { personagens, like, favorito, loading };
}

/** Busca apenas os personagens do usuário logado (Perfil / CardUsuario). */
export function useMeusPersonagens(usuarioId: number | null, token?: string | null) {
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!usuarioId) {
      setPersonagens([]);
      setLoading(false);
      return;
    }

    async function carregar() {
      setLoading(true);
      try {
        const listaBase = await buscarPersonagensUsuario(usuarioId!);
        const idsCurtidos = await buscarLikesUsuario(usuarioId!);
        const idsFavoritos = await buscarFavoritosUsuario(usuarioId!);

        const personagensComDados = await Promise.all(
          listaBase.map(async (p: any) => {
            const qtdLikes = await buscarQuantidadeLikes(p.id);
            const existingName = p.nome_criador || p.criador || p.usuario?.nome || p.usuario_nome || p.usuarioName || p.nomeCriador;
            const creatorId = p.usuario_id ?? p.usuarioId ?? p.usuario?.id ?? p.user_id ?? p.criador_id ?? null;
            const nomeCriador = existingName ? existingName : creatorId ? await buscarNomeUsuario(creatorId) : 'IA';

            return {
              ...p,
              nome_criador: nomeCriador || 'IA',
              likes: qtdLikes,
              curtidoPeloUsuario: idsCurtidos.includes(Number(p.id)),
              favoritadoPeloUsuario: idsFavoritos.includes(Number(p.id))
            };
          })
        );
        setPersonagens(personagensComDados);
      } catch (err) {
        console.log("Erro ao carregar meus personagens", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [usuarioId, token]);

  async function like(personagemId: number) {
    if (!usuarioId || !token) return;

    const { liked } = await toggleLike(usuarioId, personagemId, token);

    setPersonagens(prev =>
      prev.map(p =>
        p.id === personagemId
          ? {
              ...p,
              likes: liked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 0) - 1),
              curtidoPeloUsuario: liked
            }
          : p
      )
    );
  }

  async function favorito(personagemId: number) {
    if (!usuarioId || !token) return;

    const res = await toggleFavorito(usuarioId, personagemId, token);
    const statusFavorito = res.favorited !== undefined ? res.favorited : res.liked;

    setPersonagens(prev =>
      prev.map(p =>
        p.id === personagemId
          ? {
              ...p,
              favoritadoPeloUsuario: statusFavorito !== undefined ? statusFavorito : !p.favoritadoPeloUsuario
            }
          : p
      )
    );
  }

  return { personagens, like, favorito, loading };
}