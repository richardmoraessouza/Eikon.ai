"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FiMessageSquare,
  FiHeart,
  FiEdit2,
  FiStar,
  FiUsers,
  FiMoreVertical
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext/AuthContext";
import {
  useProfileCharacters,
  type ProfileCharacter
} from "@/hooks/useCharacters/useCharacters";
import { useSocial } from "@/hooks/useSocial/useSocial";
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

const SKELETON_COUNT = 4;

function formatInteractions(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

function CharacterCard({ type, abaAtiva, usuarioId: externalUsuarioId }: CharacterCardProps) {
  const { usuarioId: loggedUsuarioId, token } = useAuth();
  const router = useRouter();

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
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnProfile =
    loggedUsuarioId != null && usuarioIdFinal === loggedUsuarioId;

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
          if (!Number.isInteger(character.id) || character.id <= 0) {
            console.warn('[CharacterCard] Ignoring character with invalid id:', character);
            return null;
          }

          const total =
            character.likes ?? (await getQuantityLikes(character.id));
          return [character.id, total] as const;
        })
      );

      if (cancelled) return;

      setLikesCount(prev => {
        const next = { ...prev };
        for (const item of results) {
          if (!item) continue;
          const [id, total] = item;
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

  useEffect(() => {
    if (openMenuId === null) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const requireAuth = () => {
    if (!loggedUsuarioId || !token || token.trim() === "") {
      router.push("/entrar");
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

      if (type === "favoritos" && isOwnProfile && eraFavorito) {
        removeCharacter(p.id);
      }
    } catch (err: any) {
      console.error("Erro ao alternar favorito:", err);
      if (err?.response?.status === 401) router.push("/entrar");
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
      if (err?.response?.status === 401) router.push("/entrar");
    }
  };

  const handleEdit = (p: ProfileCharacter) => {
    localStorage.setItem("editarPersonagem", JSON.stringify({
      editar: true, personagem: p, tipo: p.tipo_personagem
    }));
    router.push("/create-character");
  };

  const handleCardClick = (personagemPublicId: string) => {
    router.push(`/personagem/${personagemPublicId}`);
  };

  if (loading) {
    return (
      <article className={styles.loadingWrapper} aria-busy="true" aria-label="Carregando personagens">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonLines}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
            </div>
          </div>
        ))}
      </article>
    );
  }

  if (characters.length === 0) {
    return (
      <article className={styles.textSemPersonagens}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <FiUsers size={32} />
        </span>
        <p>{EMPTY_MESSAGES[type]}</p>
      </article>
    );
  }

  return (
    <article className={styles.cardsPersonagens}>
      {characters.map((p: ProfileCharacter) => {
        const interactions = p.visualizacoes ?? 0;
        const likes = likesCount[p.id] ?? p.likes ?? 0;
        const menuOpen = openMenuId === p.id;
        const canEdit = isOwnProfile && type === "meus-personagens";
        const liked = isLiked(p.id);

        return (
          <div
            key={p.public_id}
            className={styles.character}
            onClick={(e) => {
              const isInteractive = (e.target as HTMLElement).closest("button");
              if (!isInteractive) handleCardClick(p.public_id);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(p.public_id);
              }
            }}
          >
            <div className={styles.avatarWrapper}>
              <img
                src={p.fotoia || "/image/semPerfil.jpg"}
                alt={p.nome}
                className={styles.cardImg}
                width={100}
                height={100}
                draggable={false}
              />
            </div>

            <div className={styles.content}>
              <h3 className={styles.cardTitle}>{p.nome}</h3>
              <p className={styles.cardBio}>{p.bio || "Sem bio para este personagem."}</p>
              <div className={styles.metadata}>
                <span className={styles.metadataItem}>
                  <FiMessageSquare size={12} aria-hidden="true" />
                  {formatInteractions(interactions)}
                </span>
                <span className={styles.metadataDot} aria-hidden="true">·</span>
                <span className={`${styles.metadataItem} ${liked ? styles.metadataItemLiked : ""}`}>
                  <FiHeart size={12} aria-hidden="true" />
                  {formatInteractions(likes)}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              {canEdit && (
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  aria-label={`Editar ${p.nome}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(p);
                  }}
                >
                  <FiEdit2 size={16} />
                </button>
              )}

              <div className={styles.menuWrapper} ref={menuOpen ? menuRef : undefined}>
                <button
                  type="button"
                  className={styles.actionBtn}
                  aria-label={`Opções de ${p.nome}`}
                  aria-expanded={menuOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(menuOpen ? null : p.id);
                  }}
                >
                  <FiMoreVertical size={16} />
                </button>

                {menuOpen && (
                  <div className={styles.menuDropdown} role="menu">
                    <button
                      type="button"
                      className={`${styles.menuItem} ${isLiked(p.id) ? styles.menuItemActive : ""}`}
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        handleLike(p.id);
                      }}
                    >
                      <FiHeart size={14} />
                      {isLiked(p.id) ? "Remover curtida" : "Curtir"}
                    </button>

                    <button
                      type="button"
                      className={`${styles.menuItem} ${isFavorite(p.id) ? styles.menuItemFavorite : ""}`}
                      role="menuitem"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        handleFavorito(p);
                      }}
                    >
                      <FiStar size={14} />
                      {isFavorite(p.id) ? "Remover dos favoritos" : "Favoritar"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </article>
  );
}

export default CharacterCard;