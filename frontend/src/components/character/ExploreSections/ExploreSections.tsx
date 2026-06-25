"use client";

import { useEffect, useState } from "react";
import { useCharacters } from "../../../hooks/useCharacters/useCharacters";
import type { Character } from "../../../types/characters/characters";
import type { Tag } from "../../../types/characters/characters";
import { CarouselRow } from "./CarouselRow/CarouselRow";
import { useDragScroll } from "../../../hooks/useDragScroll/useDragScroll";
import styles from "./ExploreSections.module.css";

interface ExploreSectionsProps {
  router: string;
  onTagChange?: (slug: string) => void;
}

export const ExploreSections = ({ router, onTagChange }: ExploreSectionsProps) => {
  const { loadTags, loadCharactersByCategory } = useCharacters();
  const { carouselRef: tagsRef, dragProps: tagsDragProps } = useDragScroll();
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTags, setLoadingTags] = useState<boolean>(true);

  // 1. Busca as tags do banco
  useEffect(() => {
    async function fetchSystemTags() {
      try {
        setLoadingTags(true);
        const data = await loadTags();
        setTags(data);
        
        // Se for no feed 'explore', bota a primeira ativa por padrão
        if (router === 'explore' && data && data.length > 0) {
          setActiveTag(data[0].slug);
        }
        // Se for 'search', deixa vazio ('') por padrão para vir "Todos"
      } catch (err) {
        console.error("Error loading tags:", err);
      } finally {
        setLoadingTags(false);
      }
    }
    fetchSystemTags();
  }, [loadTags, router]);

  // 2. Notifica o componente pai quando a tag muda
  useEffect(() => {
    if (onTagChange) {
      onTagChange(activeTag);
    }
  }, [activeTag, onTagChange]);

  // 3. Busca os bots da tag ativa (apenas se for a tela de explore)
  useEffect(() => {
    if (router !== 'explore' || !activeTag) return;

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
  }, [activeTag, router, loadCharactersByCategory]);

  const views: Record<string, React.ReactNode> = {
    explore: <CarouselRow characters={characters} loading={loading} />,
    search: null // Retorna null porque o grid já renderiza direto na tela de busca
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleWrapper}>
        {router === 'explore' && (
          <h3 className={styles.sectionTitle}>Encontre sua Vibe</h3>
        )}
      </div>

      <div 
        className={styles.tagsCarouselTrack} 
        ref={tagsRef}
        {...tagsDragProps}
      >
        {loadingTags ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`tag-skeleton-${index}`} className={`${styles.tagBtn} ${styles.skeletonTag}`} />
          ))
        ) : (
          <>
            {router === 'search' && (
              <button
                onClick={() => setActiveTag('')}
                className={`${styles.tagBtn} ${activeTag === '' ? styles.tagBtnActive : ''}`}
              >
                Todos
              </button>
            )}

            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.slug)}
                className={`${styles.tagBtn} ${activeTag === tag.slug ? styles.tagBtnActive : ''}`}
              >
                {tag.nome}
              </button>
            ))}
          </>
        )}
      </div>

      {views[router]}
    </div>
  );
};

export default ExploreSections;