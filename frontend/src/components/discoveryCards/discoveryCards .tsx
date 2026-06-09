import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocial } from "../../hooks/useSocial/useSocial";
import { useDragScroll } from "../../hooks/useDragScroll/useDragScroll";
import { FiMessageSquare, FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { searchCreatorNameService } from "../../services/users/userService";
import { RankBadge } from "../RankBadges/RankBadges";
import styles from "./discoveryCards.module.css";

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
  showRank?: boolean;
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
  showRank = false,
  emptyMessage = "Nenhum personagem encontrado.",
  onLoadMore,
  hasMore = false
}: DiscoveryCardsProps) => {
  const navigate = useNavigate();
  const { carouselRef, hasDragged, dragProps } = useDragScroll();
  const { isLiked, handleToggleLike, getQuantityLikes } = useSocial();
  
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});
  const [creatorNames, setCreatorNames] = useState<Record<number, string>>({});

  // Busca apenas nomes de criadores que ainda não estão no estado
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

  // Busca quantidade de likes apenas dos novos personagens
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

  // Gatilho do scroll infinito horizontal
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

  if (loading && characters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>{icon} {title}</h2></div>
      <div className={styles.loading}>Carregando...</div>
    </article>
  );

  if (!characters || characters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>{icon} {title}</h2></div>
      <div className={styles.empty}>{emptyMessage}</div>
    </article>
  );

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
          {characters.map((character, index) => (
            <div key={character.id} className={styles.card} onClick={() => handleCharacterClick(character.id)}>
              <div className={styles.imageWrapper}>
                {showRank && <RankBadge index={index} />}
                <img
                  src={character.fotoia || "/image/semPerfil.jpg"}
                  alt={character.nome}
                  className={styles.image}
                  draggable={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/image/semPerfil.jpg"; }}
                />
              </div>

              <div className={styles.info}>
                <p className={styles.name}>{character.nome}</p>
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

              <p className={styles.author}>
                @{character.usuario_id ? (creatorNames[character.usuario_id] || "Desconhecido") : "Desconhecido"}
              </p>
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