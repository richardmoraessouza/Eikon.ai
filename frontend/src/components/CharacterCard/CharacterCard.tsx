import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare, FiHeart, FiEdit2, FiStar } from "react-icons/fi";
import { useAuth } from "../../hooks/AuthContext/AuthContext";
import {
  useProfileCharacters,
  type ProfileCharacter
} from "../../hooks/useCharacters/useCharacters";
import { useSocial } from "../../hooks/useSocial/useSocial";
import styles from "./CharacterCard.module.css";

interface CharacterCardProps {
  type: "meus-personagens" | "favoritos" | "recentes";
  abaAtiva?: string;
  usuarioId?: number | null;
}

const EMPTY_MESSAGES: Record<CharacterCardProps["type"], string> = {
  "meus-personagens": "Você ainda não criou nenhum personagem.",
  favoritos: "Nenhum personagem favoritado.",
  recentes: "Nenhum personagem visualizado recentemente."
};

function CharacterCard({ type, abaAtiva, usuarioId: externalUsuarioId }: CharacterCardProps) {
  const { usuarioId: loggedUsuarioId, token } = useAuth();
  const navigate = useNavigate();

  const usuarioIdFinal =
    externalUsuarioId !== undefined ? externalUsuarioId : loggedUsuarioId;

  const { characters, loading, removeCharacter } = useProfileCharacters(
    type,
    usuarioIdFinal,
    abaAtiva
  );

  const {
    isLiked,
    isFavorite,
    handleToggleLike,
    handleToggleFavorite,
    getQuantityLikes
  } = useSocial();

  const [likesCount, setLikesCount] = useState<Record<number, number>>({});

  useEffect(() => {
    if (characters.length === 0) return;

    setLikesCount(prev => {
      const next = { ...prev };
      let changed = false;
      for (const character of characters) {
        if (character.likes !== undefined && next[character.id] === undefined) {
          next[character.id] = character.likes;
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    let cancelled = false;

    async function loadMissingLikes() {
      const results = await Promise.all(
        characters.map(async character => {
          const total =
            character.likes ?? (await getQuantityLikes(character.id));
          return [character.id, total] as const;
        })
      );

      if (cancelled) return;

      setLikesCount(prev => {
        const next = { ...prev };
        for (const [id, total] of results) {
          if (next[id] === undefined) next[id] = total;
        }
        return next;
      });
    }

    loadMissingLikes();
    return () => {
      cancelled = true;
    };
  }, [characters]);

  const requireAuth = () => {
    if (!loggedUsuarioId || !token || token.trim() === "") {
      navigate("/entrar");
      return false;
    }
    return true;
  };

  const handleFavorito = async (p: ProfileCharacter) => {
    if (!requireAuth()) return;

    const eraFavorito = isFavorite(p.id);

    try {
      await handleToggleFavorite(p.id);
      localStorage.setItem("favoritos_updated", Date.now().toString());

      if (type === "favoritos" && usuarioIdFinal === loggedUsuarioId && eraFavorito) {
        removeCharacter(p.id);
      }
    } catch (err: any) {
      console.error("Erro ao alternar favorito:", err);
      if (err?.response?.status === 401) navigate("/entrar");
    }
  };

  const handleLike = async (personagemId: number) => {
    if (!requireAuth()) return;

    const jaCurtido = isLiked(personagemId);

    setLikesCount(prev => ({
      ...prev,
      [personagemId]: jaCurtido
        ? Math.max(0, (prev[personagemId] ?? 0) - 1)
        : (prev[personagemId] ?? 0) + 1
    }));

    try {
      await handleToggleLike(personagemId);
    } catch (err: any) {
      setLikesCount(prev => ({
        ...prev,
        [personagemId]: jaCurtido
          ? (prev[personagemId] ?? 0) + 1
          : Math.max(0, (prev[personagemId] ?? 0) - 1)
      }));
      console.error("Erro ao dar like:", err);
      if (err?.response?.status === 401) navigate("/entrar");
    }
  };

  if (loading) {
    return (
      <article className="flex justify-center p-4">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </article>
    );
  }

  if (characters.length === 0) {
    return (
      <article className={`flex flex-col items-center gap-3 w-full ${styles.textSemPersonagens}`}>
        <p>{EMPTY_MESSAGES[type]}</p>
      </article>
    );
  }

  return (
    <article className={`${styles.cardsPersonagens} grid grid-cols-1 gap-3 p-2 w-4/5`}>
      {characters.map((p: ProfileCharacter) => (
        <div
          key={p.id}
          className={`flex items-center gap-3 p-3 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors cursor-pointer ${styles.character}`}
          onClick={(e) => {
            const isButton = (e.target as HTMLElement).closest("button");
            const isImg = (e.target as HTMLElement).closest("img");
            if (!isButton && !isImg) {
              window.location.href = `/personagem/${p.id}`;
            }
          }}
        >
          {type === "meus-personagens" && usuarioIdFinal === loggedUsuarioId && (
            <button
              className={styles.btnEditar}
              onClick={(e) => {
                e.stopPropagation();
                navigate("/create-character", {
                  state: { editar: true, personagem: p, tipo: p.tipo_personagem }
                });
              }}
            >
              <FiEdit2 size={16} />
            </button>
          )}

          <div>
            <img
              src={p.fotoia || "/image/semPerfil.jpg"}
              alt={p.nome}
              className={`${styles.cardImg}`}
            />
          </div>

          <div className={`flex flex-col`}>
            <h3 className={styles.cardTitle}>{p.nome}</h3>
            <p className={styles.cardBio}>{p.bio || "Sem bio para este personagem."}</p>

            <div className={styles.interactions}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike(p.id);
                }}
                className={`${styles.likeButton} ${isLiked(p.id) ? styles.active : ""}`}
              >
                <FiHeart
                  size={17}
                  style={{
                    color: isLiked(p.id) ? "#ff4b4b" : "currentColor",
                    fill: isLiked(p.id) ? "#ff4b4b" : "none",
                    transition: "all 0.2s"
                  }}
                />
                <span>{likesCount[p.id] ?? p.likes ?? 0}</span>
              </button>

              <button
                className={styles.commentButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FiMessageSquare size={17} />
                <span>{p.visualizacoes ?? 0}</span>
              </button>

              <button
                className={styles.favorito}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFavorito(p);
                }}
              >
                <FiStar
                  size={17}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    color: isFavorite(p.id) ? "#FFD700" : "#888",
                    fill: isFavorite(p.id) ? "#FFD700" : "none"
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      ))}
    </article>
  );
}

export default CharacterCard;
