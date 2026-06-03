import { useEffect, useState } from "react";
import { useCharacters } from "../../hooks/useCharacters/useCharacters";
import type { Character } from "../../types/characters/characters";
import type { Tag } from "../../types/characters/characters";
import { CarouselRow } from "./CarouselRow/CarouselRow";
import { useDragScroll } from "../../hooks/useDragScroll/useDragScroll";
import styles from "./ExploreSections.module.css";

export const ExploreSections = () => {
  const { loadTags, loadCharactersByCategory } = useCharacters();
  const { carouselRef: tagsRef, dragProps: tagsDragProps } = useDragScroll();
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Busca as tags do banco
  useEffect(() => {
    async function fetchSystemTags() {
      try {
        const data = await loadTags();
        setTags(data);
        if (data.length > 0) {
          setActiveTag(data[0].slug);
        }
      } catch (err) {
        console.error("Error loading tags:", err);
      }
    }
    fetchSystemTags();
  }, [loadTags]);

  // 2. Busca os bots da tag ativa
  useEffect(() => {
    if (!activeTag) return;

    async function fetchCategoryFeed() {
      try {
        setLoading(true);
        const data = await loadCharactersByCategory(activeTag, 20, 0);
        setCharacters(data);
      } catch (err) {
        console.error("Error fetching category characters:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategoryFeed();
  }, [activeTag, loadCharactersByCategory]);

  return (
    <div className={styles.container}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.sectionTitle}>Encontre sua Vibe</h3>
      </div>

      <div 
        className={styles.tagsCarouselTrack} 
        ref={tagsRef}
        {...tagsDragProps}
      >
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setActiveTag(tag.slug)}
            className={`${styles.tagBtn} ${activeTag === tag.slug ? styles.tagBtnActive : ''}`}
          >
            {tag.nome}
          </button>
        ))}
      </div>

      {/* Carrossel de Cards Abaixo */}
      {loading ? (
        <div className={styles.loading}>Sincronizando entidades...</div>
      ) : (
        <CarouselRow characters={characters} />
      )}
    </div>
  );
};

export default ExploreSections;