import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSocial } from "../../hooks/useSocial/useSocial";
import { useDragScroll } from "../../hooks/useDragScroll/useDragScroll";
import { FiMessageSquare, FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { searchCreatorNameService, getMiniProfileService } from "../../services/users/userService";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../utils/frame";
import MiniProfile from "../MiniProfile/MiniProfile";
import type { MiniProfileType } from "../../types/users/users";
import styles from "./discoveryCards.module.css";

// Define quantos skeletons vão aparecer na tela no primeiro carregamento
const SKELETON_COUNT = 5;

interface DiscoveryCharacter {
  id: number;
  nome: string;
  fotoia?: string | null;
  bio?: string | null;
  usuario_id?: number;
  visualizacoes?: number;
}

interface DiscoveryCardsProps {
  title: string;
  icon: React.ReactNode;
  characters: DiscoveryCharacter[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const DiscoveryCards = ({
  title,
  icon,
  characters,
  loading,
  error,
  emptyMessage = "Nenhum personagem encontrado.",
  onLoadMore,
  hasMore = false
}: DiscoveryCardsProps) => {
  const navigate = useNavigate();
  const { carouselRef, hasDragged, dragProps } = useDragScroll();
  const { isLiked, handleToggleLike, getQuantityLikes } = useSocial();

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});
  const [creatorNames, setCreatorNames] = useState<Record<number, string>>({});
  const [activeProfile, setActiveProfile] = useState<MiniProfileType | null>(null);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  const loadMiniProfileData = useCallback(async (userId: number) => {
    try {
      const data = await getMiniProfileService(userId);
      setActiveProfile(data);
    } catch (err) {
      console.error("Erro ao carregar dados do mini perfil:", err);
    }
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

  const handleMouseEnterAuthor = (userId: number, characterId: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    
    hoverTimerRef.current = setTimeout(async () => {
      setActiveCardId(characterId);
      await loadMiniProfileData(userId);
    }, 200);
  };

  const handleMouseLeaveAuthor = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setActiveCardId(null);
    setActiveProfile(null);
  };

  const handleAuthorClick = async (e: React.MouseEvent, userId: number, characterId: number) => {
    e.stopPropagation();
    if (activeProfile && activeCardId === characterId) {
      setActiveProfile(null);
      setActiveCardId(null);
    } else {
      setActiveCardId(characterId);
      await loadMiniProfileData(userId);
    }
  };

  useEffect(() => {
    async function loadCreatorNames() {
      const namesMap: Record<number, string> = { ...creatorNames };
      let needUpdate = false;

      for (const character of characters) {
        if (!character.usuario_id || namesMap[character.usuario_id]) continue;

        try {
          const creator = await searchCreatorNameService(character.usuario_id);
          namesMap[character.usuario_id] = creator.nome;
          needUpdate = true;
        } catch {
          namesMap[character.usuario_id] = "Desconhecido";
          needUpdate = true;
        }
      }
      if (needUpdate) setCreatorNames(namesMap);
    }
    if (characters.length > 0) loadCreatorNames();
  }, [characters]);

  useEffect(() => {
    async function loadLikesCount() {
      const likesMap: Record<number, number> = { ...likesCount };
      let needUpdate = false;

      for (const character of characters) {
        if (likesMap[character.id] !== undefined) continue;

        const total = await getQuantityLikes(character.id);
        likesMap[character.id] = total;
        needUpdate = true;
      }
      if (needUpdate) setLikesCount(likesMap);
    }
    if (characters.length > 0) loadLikesCount();
  }, [characters, getQuantityLikes]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasMore || loading) return;

    const target = e.currentTarget;
    const currentPosition = target.scrollLeft + target.clientWidth;
    const totalWidth = target.scrollWidth;

    if (totalWidth - currentPosition < 300) {
      onLoadMore();
    }
  };

  const handleLikeClick = async (e: React.MouseEvent<SVGElement>, characterId: number) => {
    e.stopPropagation();
    await handleToggleLike(characterId);
    const updatedTotal = await getQuantityLikes(characterId);
    setLikesCount(prev => ({ ...prev, [characterId]: updatedTotal }));
  };

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  };

  const handleCharacterClick = (characterId: number) => {
    if (!hasDragged) navigate(`/personagem/${characterId}`);
  };

  if (error) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>{icon} {title}</h2></div>
      <div className={styles.error}>{error}</div>
    </article>
  );

  // 2. Renderização do Skeleton no Primeiro Carregamento (Substituído o texto fixo)
  if (loading && characters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>
          <span className={styles.headerIcon}>{icon}</span>
          {title}
        </h2>
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

  // 3. Renderização de Estado Vazio
  if (!characters || characters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>{icon} {title}</h2></div>
      <div className={styles.empty}>{emptyMessage}</div>
    </article>
  );

  // 4. Renderização Principal
  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>
          <span className={styles.headerIcon}>{icon}</span>
          {title}
        </h2>
      </div>

      <div className={styles.carouselWrapper}>
        <button onClick={() => scroll("left")} className={`${styles.navBtn} ${styles.navLeft}`} aria-label="Anterior">
          <FiChevronLeft size={16} />
        </button>
        <button onClick={() => scroll("right")} className={`${styles.navBtn} ${styles.navRight}`} aria-label="Próximo">
          <FiChevronRight size={16} />
        </button>

        <div
          className={styles.carouselTrack}
          ref={carouselRef}
          onScroll={handleScroll}
          {...dragProps}
        >
          {characters.map((character) => (
            <div key={character.id} className={styles.card} onClick={() => handleCharacterClick(character.id)}>

              <div className={styles.imageWrapper}>
                <img
                  src={character.fotoia || "/image/semPerfil.jpg"}
                  alt={character.nome}
                  className={styles.image}
                  draggable={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/image/semPerfil.jpg"; }}
                />
              </div>

              <div className={styles.info}>
               <Link 
                  to={`/perfil/${character.usuario_id}`} 
                  className={styles.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasDragged) e.preventDefault();
                  }}
                >
                  {character.nome}
                </Link>
                {character.bio && <p className={styles.bio}>{character.bio}</p>}
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <FiHeart
                    size={12}
                    onClick={(e) => handleLikeClick(e, character.id)}
                    style={{
                      cursor: "pointer",
                      color: isLiked(character.id) ? "#ef4444" : "currentColor",
                      fill: isLiked(character.id) ? "#ef4444" : "none",
                      transition: "all 0.2s",
                    }}
                  />
                  <span>{likesCount[character.id] ?? 0}</span>
                </div>
                <div className={styles.stat}>
                  <FiMessageSquare size={12} />
                  <span>{character.visualizacoes ?? 0}</span>
                </div>
              </div>

              <div
                className={styles.authorContainer}
                onMouseEnter={() => character.usuario_id && handleMouseEnterAuthor(character.usuario_id, character.id)}
                onMouseLeave={handleMouseLeaveAuthor}
                onClick={(e) => character.usuario_id && handleAuthorClick(e, character.usuario_id, character.id)}
              >
                <p className={styles.author}>
                  @{character.usuario_id ? (creatorNames[character.usuario_id] || "Desconhecido") : "Desconhecido"}
                </p>

                {activeProfile && activeCardId === character.id && (
                  <div className={styles.popoverWrapper}>
                    <MiniProfile
                      usuarioId={activeProfile.usuarioId}
                      nome={activeProfile.nome}
                      foto={activeProfile.foto}
                      descricao={activeProfile.descricao}
                      frame={activeProfile.frame}
                      is_online={activeProfile.is_online}
                      onClose={() => { setActiveProfile(null); setActiveCardId(null); }}
                    />
                  </div>
                )}
              </div>

            </div>
          ))}
          {loading && (
            <div className={`${styles.card} ${styles.cardLoadingIndicator}`}>
              <div className={styles.spinner}></div>
              <p>Buscando mais...</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};