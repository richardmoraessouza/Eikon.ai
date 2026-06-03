import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExplore } from "../../hooks/useExplore/useExplore";
import { useSocial } from "../../hooks/useSocial/useSocial";
import type { Character } from "../../types/characters/characters";
import styles from "./CardExplore.module.css";
import { FiTrendingUp, FiMessageSquare, FiHeart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { searchCreatorNameService } from "../../services/users/userService";

const CardExplore = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const { characters, loading, error } = useExplore();
  const { isLiked, handleToggleLike, getQuantityLikes } = useSocial();
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});
  const [creatorNames, setCreatorNames] = useState<Record<number, string>>({});

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 3) setHasDragged(true);
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    async function loadCreatorNames() {
      const namesMap: Record<number, string> = {};
      for (const character of characters) {
        try {
          if (character.nome_criador) {
            namesMap[character.id] = character.nome_criador;
          } else if (character.usuario_id) {
            const creator = await searchCreatorNameService(character.usuario_id);
            namesMap[character.id] = creator.nome;
          } else {
            namesMap[character.id] = "Desconhecido";
          }
        } catch {
          namesMap[character.id] = "Desconhecido";
        }
      }
      setCreatorNames(namesMap);
    }
    if (characters.length > 0) loadCreatorNames();
  }, [characters]);

  useEffect(() => {
    async function loadLikesCount() {
      const likesMap: Record<number, number> = {};
      for (const character of characters) {
        const total = await getQuantityLikes(character.id);
        likesMap[character.id] = total;
      }
      setLikesCount(likesMap);
    }
    if (characters.length > 0) loadLikesCount();
  }, [characters]);

  const handleLikeClick = async (e: React.MouseEvent<SVGElement>, characterId: number) => {
    e.stopPropagation();
    await handleToggleLike(characterId);
    const updatedTotal = await getQuantityLikes(characterId);
    setLikesCount(prev => ({ ...prev, [characterId]: updatedTotal }));
  };

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === "right" ? 160 : -160, behavior: "smooth" });
  };

  const handleCharacterClick = (characterId: number) => {
    if (!hasDragged) navigate(`/personagem/${characterId}`);
  };

  if (error) return (
    <article className={styles.container}>
      <div className={styles.header}><h2><FiTrendingUp /> Para Você</h2></div>
      <div className={styles.error}>{error}</div>
    </article>
  );

  if (loading) return (
    <article className={styles.container}>
      <div className={styles.header}><h2><FiTrendingUp /> Para Você</h2></div>
      <div className={styles.loading}>Carregando...</div>
    </article>
  );

  if (!characters || characters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2><FiTrendingUp /> Para Você</h2></div>
      <div className={styles.empty}>Nenhum personagem encontrado.</div>
    </article>
  );

  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>
          <span className={styles.headerIcon}><FiTrendingUp /></span>
          Para Você
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
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {characters.map((character: Character, index: number) => (
            <div
              key={`${character.id}-${index}`}
              className={styles.card}
              onClick={() => handleCharacterClick(character.id)}
            >
              <img
                src={character.fotoia || "/image/semPerfil.jpg"}
                alt={character.nome}
                className={styles.image}
                draggable={false}
                onError={(e) => { (e.target as HTMLImageElement).src = "/image/semPerfil.jpg"; }}
              />

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

              <p className={styles.author}>@{creatorNames[character.id] || "Desconhecido"}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

export default CardExplore;