"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMessageSquare, FiHeart, FiEdit2, FiUsers, FiMoreVertical, FiGlobe, FiLock } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext/AuthContext";
import { useProfileCharacters, type ProfileCharacter } from "@/hooks/useCharacters/useProfileCharacters";
import { useCharacters } from "@/hooks/useCharacters/useCharacters";
import { useSocial } from "@/hooks/useSocial/useSocial";
import styles from "./CharacterCard.module.css";

interface CharacterCardProps {
  type: "meus-personagens" | "favoritos" | "recentes";
  abaAtiva?: string;
  usuarioId?: number | null;
  hideFavoriteCharacter?: boolean;
  hideRecentCharacter?: boolean;
}

type CharacterComVisibilidade = ProfileCharacter & { publico?: boolean; is_public?: boolean };

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

function CharacterCard({ type, abaAtiva, usuarioId: externalUsuarioId, hideFavoriteCharacter, hideRecentCharacter }: CharacterCardProps) {
  const {
    usuarioId: loggedUsuarioId,
    token,
    hideFavoriteCharacter: ctxHideFavorite,
    hideRecentCharacter: ctxHideRecent,
    estaLogado,
    loading: authLoading,
  } = useAuth();
  const router = useRouter();

  const usuarioIdFinal =
    externalUsuarioId !== undefined ? externalUsuarioId : loggedUsuarioId;

  const resolvedHideFavorite = hideFavoriteCharacter === undefined ? ctxHideFavorite : hideFavoriteCharacter;
  const resolvedHideRecent = hideRecentCharacter === undefined ? ctxHideRecent : hideRecentCharacter;
  
  const isOwnProfile =
    loggedUsuarioId != null && usuarioIdFinal === loggedUsuarioId;

  const isHidden =
    !isOwnProfile && (
      (type === "favoritos" && Boolean(resolvedHideFavorite)) ||
      (type === "recentes" && Boolean(resolvedHideRecent))
    );

  const { characters, loading } = useProfileCharacters(
    type,
    usuarioIdFinal,
    abaAtiva
  );

  // Instanciando o hook geral para obter a função updateVisibility
  const { updateVisibility } = useCharacters();

  if (isHidden) {
    return null;
  }

  const {
    isLiked,
    handleToggleLike,
    getQuantityLikes
  } = useSocial();

  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [publicoOverride, setPublicoOverride] = useState<Record<number, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);

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
          if (!character.public_id) {
            console.warn('[CharacterCard] Ignoring character with invalid public_id:', character);
            return null;
          }

          const total =
            character.likes ?? (await getQuantityLikes(character.public_id));
          return [character.public_id, total] as const;
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
    if (authLoading) {
      return false;
    }

    if (!estaLogado || !loggedUsuarioId) {
      router.replace("/login");
      return false;
    }

    return true;
  };

  const handleLike = async (personagemId: string) => {
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
      if (err?.response?.status === 401) router.replace("/login");
    }
  };

  const handleEdit = (p: ProfileCharacter) => {
    const identifier = p.public_id || p.id;
    if (!identifier) return;

    const editPayload = {
      editar: true,
      personagem: {
        ...p,
        public_id: p.public_id || p.id,
        id: p.id,
        tipo_personagem: p.tipo_personagem,
        is_public: p.is_public ?? p.publico ?? true
      },
      tipo: p.tipo_personagem
    };

    localStorage.setItem("editarPersonagem", JSON.stringify(editPayload));
    router.push(`/character/${encodeURIComponent(String(identifier))}`);
  };

  const isPublicoPersonagem = (p: CharacterComVisibilidade) => {
    const valorExplicito = p.is_public ?? p.publico;
    return publicoOverride[p.id] ?? valorExplicito ?? true;
  };

  const handleTogglePublico = async (p: CharacterComVisibilidade) => {
    if (!requireAuth()) return;

    const atual = isPublicoPersonagem(p);
    const novoValor = !atual;

    // Atualização otimista na UI
    setPublicoOverride(prev => ({ ...prev, [p.id]: novoValor }));

    try {
      // Usando a função correta do hook passando public_id, boolean e token
      await updateVisibility(p.public_id, novoValor, token);
    } catch (err: any) {
      // Reverte o estado caso dê erro
      setPublicoOverride(prev => ({ ...prev, [p.id]: atual }));
      if (err?.response?.status === 401) router.replace("/login");
    }
  };

  const handleCardClick = (personagemPublicId: string) => {
    router.push(`/chat/${personagemPublicId}`);
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
      {characters.map((p: CharacterComVisibilidade, idx: number) => {
        const interactions = p.visualizacoes ?? 0;
        const likes = likesCount[p.public_id] ?? p.likes ?? 0;
        const menuKey = p.public_id ?? String(p.id ?? `char-${idx}`);
        const menuOpen = openMenuId === menuKey;
        const canEdit = isOwnProfile && type === "meus-personagens";
        const liked = isLiked(p.public_id);
        const publico = isPublicoPersonagem(p);
        const characterName = typeof p.nome === "string" && p.nome.trim() ? p.nome.trim() : "Foto do personagem";

        return (
          <div
            key={p.public_id ?? p.id ?? `char-${idx}`}
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
              <Image
                src={p.fotoia || "/image/semPerfil.jpg"}
                alt={characterName}
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

                <button
                  type="button"
                  className={`${styles.metadataItem} ${styles.metadataBtn} ${liked ? styles.metadataItemLiked : ""}`}
                  aria-label={liked ? `Remover curtida de ${p.nome}` : `Curtir ${p.nome}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(p.public_id);
                  }}
                >
                  <FiHeart size={12} aria-hidden="true" />
                  {formatInteractions(likes)}
                </button>
              </div>
            </div>

            {canEdit && (
              <div className={styles.actions}>
                <div className={styles.menuWrapper} ref={menuOpen ? menuRef : undefined}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    aria-label={`Opções de ${p.nome}`}
                    aria-expanded={menuOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(menuOpen ? null : menuKey);
                    }}
                  >
                    <FiMoreVertical size={16} />
                  </button>

                  {menuOpen && (
                    <div className={styles.menuDropdown} role="menu">
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          handleEdit(p);
                        }}
                      >
                        <FiEdit2 size={14} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          handleTogglePublico(p);
                        }}
                      >
                        {publico ? <FiLock size={14} /> : <FiGlobe size={14} />}
                        {publico ? "Tornar privado" : "Tornar público"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </article>
  );
}

export default CharacterCard;