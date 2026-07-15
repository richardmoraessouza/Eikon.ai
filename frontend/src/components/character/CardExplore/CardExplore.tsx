"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useExploreCharacters } from "../../../hooks/useCharacters/useExploreCharacters";
import { useSocial } from "../../../hooks/useSocial/useSocial";
import { useDragScroll } from "../../../hooks/useDragScroll/useDragScroll";
import { FiMessageSquare, FiHeart } from "react-icons/fi";
import { searchCreatorNameService, getMiniProfileService } from "../../../services/users/userService";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../../utils/frame";
import MiniProfile from "../../profiles/MiniProfile/MiniProfile";
import type { MiniProfileType } from "../../../types/users/users";
import type { Character } from "../../../types/characters/characters";
import styles from "./CardExplore.module.css";

const SKELETON_COUNT = 5;

interface PopoverPosition {
  top: number;
  left: number;
}

const POPOVER_WIDTH = 252;
const POPOVER_MARGIN = 16;
const POPOVER_GAP = 8;

const CardExplore = () => {
  const router = useRouter();
  const { carouselRef, hasDragged, dragProps } = useDragScroll();
  const { exploreCharacters, exploreLoading, exploreError, exploreHasMore, loadMoreExplore } = useExploreCharacters();
  const { isLiked, handleToggleLike, getQuantityLikes } = useSocial();

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guarda um "id de requisição" para descartar respostas de hover desatualizadas
  // (ex.: usuário passa o mouse rápido do card A para o card B).
  const hoverRequestRef = useRef(0);

  // Controla a exibição do fade de scroll enquanto o usuário rola o carrossel.
  const scrollFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [creatorNames, setCreatorNames] = useState<Record<number, string>>({});
  const [creatorUsernames, setCreatorUsernames] = useState<Record<number, string | null>>({});
  const [activeProfile, setActiveProfile] = useState<MiniProfileType | null>(null);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const [likedOverride, setLikedOverride] = useState<Record<string, boolean>>({});
  const [scrollFade, setScrollFade] = useState({ left: false, right: false });

  useEffect(() => setMounted(true), []);

  const isCharacterLiked = (id: string) =>
  likedOverride[id] ?? isLiked(id);

  // Limpa qualquer timer pendente ao desmontar o componente.
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (scrollFadeTimerRef.current) clearTimeout(scrollFadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const { usuarioId, frame } = (event as CustomEvent<FrameUpdatedDetail>).detail;
      setActiveProfile(prev =>
        prev && prev.usuarioId === usuarioId ? { ...prev, frame } : prev
      );
    };
    window.addEventListener(FRAME_UPDATED_EVENT, handler);
    return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
  }, []);

  const computePosition = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(
      POPOVER_MARGIN,
      Math.min(left, window.innerWidth - POPOVER_WIDTH - POPOVER_MARGIN)
    );
    const top = Math.max(POPOVER_MARGIN, rect.top - POPOVER_GAP);
    setPopoverPos({ top, left });
  };

  const closePopover = () => {
    hoverRequestRef.current += 1; // invalida qualquer fetch de perfil em andamento
    setActiveProfile(null);
    setActiveCardId(null);
    setPopoverPos(null);
  };

  const handleMouseEnterAuthor = (
    e: React.MouseEvent<HTMLDivElement>,
    userId: number,
    characterId: number
  ) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const anchor = e.currentTarget;
    const requestId = ++hoverRequestRef.current;

    hoverTimerRef.current = setTimeout(async () => {
      computePosition(anchor);
      setActiveCardId(characterId);
      try {
        const data = await getMiniProfileService(userId);
        // Só aplica o resultado se ainda for o hover mais recente,
        // evitando mostrar o perfil errado quando o mouse já mudou de card.
        if (hoverRequestRef.current === requestId) {
          setActiveProfile(data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do mini perfil:", err);
      }
    }, 200);
  };

  const handleMouseLeaveAuthor = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(closePopover, 120);
  };

  const handleAuthorClick = (e: React.MouseEvent<HTMLDivElement>, userId: number) => {
    e.stopPropagation();
    if (hasDragged) return;

    const username = creatorUsernames[userId];
    // Só navega quando o username já está disponível. Nunca usa o ID na URL.
    if (username) {
      router.push(`/profile/${username}`);
    }
  };

  useEffect(() => {
    if (!activeCardId) return;
    const handleWindowChange = () => closePopover();
    window.addEventListener("scroll", handleWindowChange, true);
    window.addEventListener("resize", handleWindowChange);
    return () => {
      window.removeEventListener("scroll", handleWindowChange, true);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [activeCardId]);

  // Carrega nome/username dos criadores em paralelo e usa updates funcionais
  // para não sobrescrever dados carregados por execuções concorrentes deste efeito.
  useEffect(() => {
    async function loadCreatorNames() {
      const idsToFetch = Array.from(
        new Set(exploreCharacters.map(c => c.usuario_id).filter((id): id is number => !!id))
      ).filter(id => !(id in creatorNames));

      if (idsToFetch.length === 0) return;

      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const creator = await searchCreatorNameService(id);
            return { id, nome: creator.nome, username: creator.username ?? null };
          } catch {
            return { id, nome: "Desconhecido", username: null };
          }
        })
      );

      setCreatorNames(prev => {
        const next = { ...prev };
        results.forEach(({ id, nome }) => { next[id] = nome; });
        return next;
      });
      setCreatorUsernames(prev => {
        const next = { ...prev };
        results.forEach(({ id, username }) => { next[id] = username; });
        return next;
      });
    }
    if (exploreCharacters.length > 0) loadCreatorNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreCharacters]);

  // Carrega contagem de likes em paralelo, também com update funcional.
  useEffect(() => {
    async function loadLikesCount() {
      const idsToFetch = exploreCharacters
        .map(c => c.public_id)
        .filter((id): id is string => Boolean(id) && likesCount[id] === undefined);

      if (idsToFetch.length === 0) return;

      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            return { id, count: await getQuantityLikes(id) };
          } catch {
            return { id, count: 0 };
          }
        })
      );

      setLikesCount(prev => {
        const next = { ...prev };
        results.forEach(({ id, count }) => { next[id] = count; });
        return next;
      });
    }
    if (exploreCharacters.length > 0) loadLikesCount();
  }, [exploreCharacters, getQuantityLikes]);

  const updateScrollFade = (target: HTMLDivElement) => {
    const canScrollLeft = target.scrollLeft > 4;
    const canScrollRight =
      target.scrollWidth - (target.scrollLeft + target.clientWidth) > 4;

    window.requestAnimationFrame(() => {
      setScrollFade({ left: canScrollLeft, right: canScrollRight });
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    updateScrollFade(target);

    if (!exploreHasMore || exploreLoading) return;
    if (target.scrollWidth - (target.scrollLeft + target.clientWidth) < 300) {
      loadMoreExplore();
    }
  };

  // Calcula o fade inicial assim que os cards carregam (caso já haja
  // conteúdo suficiente para rolar, mesmo sem o usuário ter interagido).
  useEffect(() => {
    if (carouselRef.current) updateScrollFade(carouselRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreCharacters]);

  const handleLikeClick = async (
    e: React.MouseEvent<SVGElement>,
    characterId: string
  ) => {
    e.stopPropagation();

    const liked = isCharacterLiked(characterId);

    // Atualiza UI imediatamente
    setLikedOverride(prev => ({
      ...prev,
      [characterId]: !liked,
    }));

    setLikesCount(prev => ({
      ...prev,
      [characterId]: Math.max(
        0,
        (prev[characterId] ?? 0) + (liked ? -1 : 1)
      ),
    }));

    try {
      await handleToggleLike(characterId);
    } catch {
      // Desfaz caso dê erro
      setLikedOverride(prev => ({
        ...prev,
        [characterId]: liked,
      }));

      setLikesCount(prev => ({
        ...prev,
        [characterId]: Math.max(
          0,
          (prev[characterId] ?? 0) + (liked ? 1 : -1)
        ),
      }));
    }
  };

  const handleCharacterClick = (characterPublicId: string) => {
    if (!hasDragged) router.push(`/chat/${characterPublicId}`);
  };

  const normalizeTags = (tags?: Character["tags"]) =>
    (tags ?? [])
      .map((tag) => {
        if (typeof tag === "string") return tag;
        return tag?.nome || tag?.name || "";
      })
      .filter(Boolean);

  if (exploreError) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>Para Você</h2></div>
      <div className={styles.error}>{exploreError}</div>
    </article>
  );

  if (exploreLoading && exploreCharacters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>Para Você</h2>
      </div>
      <div className={styles.carouselWrapper}>
        <div className={styles.carouselTrack} aria-busy="true" aria-label="Carregando conteúdos">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div key={index} className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.imageWrapper}>
                <div className={styles.skeletonImage} />
              </div>
              <div className={styles.info}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonBio} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );

  if (!exploreCharacters || exploreCharacters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>Para Você</h2></div>
      <div className={styles.empty}>Nenhum personagem encontrado.</div>
    </article>
  );

  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>Para Você</h2>
      </div>

      <div className={styles.carouselWrapper}>
        <div
          className={`${styles.scrollFade} ${styles.scrollFadeLeft} ${scrollFade.left ? styles.visible : ""}`}
          aria-hidden="true"
        />
        <div
          className={`${styles.scrollFade} ${styles.scrollFadeRight} ${scrollFade.right ? styles.visible : ""}`}
          aria-hidden="true"
        />

        <div className={styles.carouselTrack} ref={carouselRef} onScroll={handleScroll} {...dragProps}>
          {exploreCharacters.map((character: Character) => (
            <div key={character.public_id ?? character.id} className={styles.card} onClick={() => handleCharacterClick(character.public_id ?? String(character.id))}>
              <div className={styles.imageWrapper} style={{ position: "relative" }}>
                <Image
                  src={character.fotoia || "/image/semPerfil.jpg"}
                  alt={character.nome}
                  fill
                  sizes="(max-width: 768px) 100vw, 240px"
                  className={styles.image}
                  style={{ objectFit: "cover" }}
                  draggable={false}
                  unoptimized
                />
              </div>

              <div className={styles.info}>
                <p className={styles.name}>{character.nome}</p>
                <div
                  className={styles.authorContainer}
                  onMouseEnter={(e) => character.usuario_id != null && handleMouseEnterAuthor(e, character.usuario_id, character.id)}
                  onMouseLeave={handleMouseLeaveAuthor}
                  onClick={(e) => character.usuario_id != null && handleAuthorClick(e, character.usuario_id)}
                >
                  <p className={styles.author}>
                    {character.usuario_id
                      ? `@${creatorUsernames[character.usuario_id] || creatorNames[character.usuario_id] || "Desconhecido"}`
                      : "@Desconhecido"}
                  </p>
                </div>

                <p className={styles.bio}>
                  {character.bio ? character.bio : ` ${character.nome} ainda não tem bio.`}
                </p>
                {(() => {
                  const displayTags = normalizeTags(character.tags);
                  return displayTags.length > 0 ? (
                    <div className={styles.tagsContainer}>
                      {displayTags.map((tag, index) => (
                        <span key={`${tag}-${index}`} className={styles.tagItem}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}

             
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <FiHeart
                    size={12}
                    onClick={(e) => handleLikeClick(e, character.public_id ?? String(character.id))}
                    style={{
                      cursor: "pointer",
                      color: isCharacterLiked(character.public_id ?? String(character.id)) ? "#ef4444" : "currentColor",
                      fill: isCharacterLiked(character.public_id ?? String(character.id)) ? "#ef4444" : "none",
                      transition: "all 0.2s",
                    }}
                  />
                  <span>{likesCount[character.public_id ?? String(character.id)] ?? 0}</span>
                </div>
                <div className={styles.stat}>
                  <FiMessageSquare size={12} />
                  <span>{character.visualizacoes ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
          {exploreLoading && (
            <div className={`${styles.card} ${styles.cardLoadingIndicator}`}>
              <div className={styles.spinner}></div>
              <p>Buscando mais...</p>
            </div>
          )}
        </div>
      </div>

      {mounted && activeProfile && activeCardId !== null && popoverPos &&
        createPortal(
          <div
            className={styles.popoverPortal}
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              transform: `translateY(calc(-100% - ${POPOVER_GAP}px))`,
              width: POPOVER_WIDTH,
              maxWidth: `calc(100vw - ${POPOVER_MARGIN * 2}px)`,
              zIndex: 2147483647,
            }}
            onMouseEnter={() => hoverTimerRef.current && clearTimeout(hoverTimerRef.current)}
            onMouseLeave={closePopover}
          >
            <MiniProfile
              usuarioId={activeProfile.usuarioId}
              nome={activeProfile.nome}
              foto={activeProfile.foto}
              descricao={activeProfile.descricao}
              frame={activeProfile.frame}
              nivel={activeProfile.nivel}
              is_online={activeProfile.is_online}
            />
          </div>,
          document.body
        )}
    </article>
  );
};

export default CardExplore;