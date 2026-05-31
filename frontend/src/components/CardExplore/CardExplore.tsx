import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExplore } from "../../hooks/useExplore/useExplore";
import { useSocial } from "../../hooks/useSocial/useSocial";
import type { Character } from "../../types/characters/characters";
import styles from "./CardExplore.module.css";
import { FiTrendingUp, FiMessageSquare, FiHeart } from "react-icons/fi";
import { searchCreatorName } from "../../services/users/userService";

const CardExplore = () => {
  const navigate = useNavigate();
  const { characters, loading, error } = useExplore();
  const { isLiked, handleToggleLike, getQuantityLikes } = useSocial();
  const [likesCount, setLikesCount] = useState<Record<number, number>>({});
  const [creatorNames, setCreatorNames] = useState<Record<number, string>>({});

  // search for the name of the character's creator
  useEffect(() => {
    async function loadCreatorNames() {
      const namesMap: Record<number, string> = {};
      
      for (const character of characters) {
        try {
          // Use nome_criador if available, otherwise fetch it
          if (character.nome_criador) {
            namesMap[character.id] = character.nome_criador;
          } else if (character.usuario_id) {
            const creator = await searchCreatorName(character.usuario_id);
            namesMap[character.id] = creator.nome;
          } else {
            namesMap[character.id] = "Desconhecido";
          }
        } catch (err) {
          console.error(`Erro ao buscar nome do criador ${character.usuario_id}:`, err);
          namesMap[character.id] = "Desconhecido";
        }
      }
      
      setCreatorNames(namesMap);
    }

    if (characters.length > 0) {
      loadCreatorNames();
    }
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

    if (characters.length > 0) {
      loadLikesCount();
    }
  }, [characters]);

  const handleLikeClick = async (
    e: React.MouseEvent<SVGElement>,
    characterId: number
  ) => {
    e.stopPropagation();

    await handleToggleLike(characterId);

    const updatedTotal = await getQuantityLikes(characterId);

    setLikesCount(prev => ({
      ...prev,
      [characterId]: updatedTotal
    }));
  };

  const handleCharacterClick = (characterId: number) => {
    navigate(`/personagem/${characterId}`);
  };

  if (error) return (
    <article className={styles.container}>
      <div className={styles.header}><h2><FiTrendingUp /> Populares da Semana</h2></div>
      <div className={styles.error}>{error}</div>
    </article>
  );

  if (loading) return (
    <article className={styles.container}>
      <div className={styles.header}><h2><FiTrendingUp /> Populares da Semana</h2></div>
      <div className={styles.loading}>Carregando...</div>
    </article>
  );

  if (!characters || characters.length === 0) return (
    <article className={styles.container}>
      <div className={styles.header}><h2><FiTrendingUp /> Populares da Semana</h2></div>
      <div className={styles.empty}>Nenhum personagem popular nesta semana ainda.</div>
    </article>
  );

  return (
    <article className={styles.container}>
      <div className={styles.grid}>
          {characters.map((character: Character, index: number) => (
            <div
              key={`${character.id}-${index}`}
              className={styles.card}
              onClick={() => handleCharacterClick(character.id)}
            >
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
                <p className={styles.name}>{character.nome}</p>

                {character.bio && (
                  <p className={styles.bio}>{character.bio}</p>
                )}
              </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <FiHeart
                      size={12}
                      onClick={(e) => handleLikeClick(e, character.id)}
                      style={{
                        cursor: 'pointer',
                        color: isLiked(character.id) ? '#ef4444' : 'currentColor',
                        fill: isLiked(character.id) ? '#ef4444' : 'none',
                        transition: 'all 0.2s'
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
    </article>
  );
};
export default CardExplore;