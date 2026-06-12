import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacters } from "../../hooks/useCharacters/useCharacters";
import { useSocial } from "../../hooks/useSocial/useSocial";
import { useDragScroll } from "../../hooks/useDragScroll/useDragScroll";
import type { Character } from "../../types/characters/characters";
import styles from "./CardExplore.module.css";
import { FiMessageSquare, FiHeart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { searchCreatorNameService } from "../../services/users/userService";

// Define quantos skeletons vão aparecer na tela no primeiro carregamento
const SKELETON_COUNT = 5; 

const CardExplore = () => {
  const navigate = useNavigate();
  const { carouselRef, hasDragged, dragProps } = useDragScroll();
  const { exploreCharacters, exploreLoading, exploreError, exploreHasMore, loadMoreExplore } = useCharacters();
  const { isLiked, handleToggleLike, getQuantityLikes } = useSocial();
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});
  const [creatorNames, setCreatorNames] = useState<Record<number, string>>({});

  // Busca nomes dos criadores evitando duplicar chamadas
  useEffect(() => {
    async function loadCreatorNames() {
      const namesMap: Record<number, string> = { ...creatorNames };
      let changed = false;

      for (const character of exploreCharacters) {
        if (namesMap[character.id] !== undefined) continue;

        try {
          if (character.nome_criador) {
            namesMap[character.id] = character.nome_criador;
            changed = true;
          } else if (character.usuario_id) {
            const creator = await searchCreatorNameService(character.usuario_id);
            namesMap[character.id] = creator.nome;
            changed = true;
          } else {
            namesMap[character.id] = "Desconhecido";
            changed = true;
          }
        } catch {
          namesMap[character.id] = "Desconhecido";
          changed = true;
        }
      }
      if (changed) setCreatorNames(namesMap);
    }
    if (exploreCharacters.length > 0) loadCreatorNames();
  }, [exploreCharacters]);

  // Busca contagem de likes evitando duplicar chamadas
  useEffect(() => {
    async function loadLikesCount() {
      const likesMap: Record<number, number> = { ...likesCount };
      let changed = false;

      for (const character of exploreCharacters) {
        if (likesMap[character.id] !== undefined) continue;
        
        const total = await getQuantityLikes(character.id);
        likesMap[character.id] = total;
        changed = true;
      }
      if (changed) setLikesCount(likesMap);
    }
    if (exploreCharacters.length > 0) loadLikesCount();
  }, [exploreCharacters]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!exploreHasMore || exploreLoading) return;
    const target = e.currentTarget;
    if (target.scrollWidth - (target.scrollLeft + target.clientWidth) < 300) {
      loadMoreExplore();
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
    carouselRef.current.scrollBy({ left: dir === "right" ? 160 : -160, behavior: "smooth" });
  };

  const handleCharacterClick = (characterId: number) => {
    if (!hasDragged) navigate(`/personagem/${characterId}`);
  };

  // 1. Tratamento de Erro
  if (exploreError) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>Para Você</h2></div>
      <div className={styles.error}>{exploreError}</div>
    </article>
  );

  // 2. Estado de Carregamento Inicial (Skeleton)
  if (exploreLoading && exploreCharacters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>Para Você</h2>
      </div>
      <div className={styles.carouselWrapper}>
        <div className={styles.carouselTrack} aria-busy="true" aria-label="Carregando conteúdos">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonBio} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );

  // 3. Estado de Lista Vazia (Caso a API responda e não venha nada)
  if (!exploreCharacters || exploreCharacters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2>Para Você</h2></div>
      <div className={styles.empty}>Nenhum personagem encontrado.</div>
    </article>
  );

  // 4. Renderização Principal do Conteúdo
  return (
    <article className={styles.container}>
      <div className={styles.header}>
        <h2>Para Você</h2>
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
          {exploreCharacters.map((character: Character, index: number) => (
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

          {exploreLoading && (
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

export default CardExplore;