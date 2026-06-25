"use client"; // Necessário devido ao gerenciamento de estado local (useState) e submissão de formulário

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Hook de navegação oficial do App Router
import { FiSearch } from 'react-icons/fi';
import { useCharacters } from '../../../hooks/useCharacters/useCharacters'; 
import type { Character } from '../../../types/characters/characters'; 
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch?: (resultados: Character[], termo: string) => void;
  onSearchStart?: () => void;
}

function SearchBar({ onSearch, onSearchStart }: SearchBarProps) {
  const [nomePersonagem, setNomePersonagem] = useState<string>("");
  const router = useRouter();
  
  const { searchCharacterByName, searchLoading } = useCharacters();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const termoFormatado = nomePersonagem.trim();
    if (!termoFormatado) return;

    if (onSearchStart) {
      onSearchStart();
    }

    const resultados = await searchCharacterByName(termoFormatado);
    
    if (onSearch) {
      onSearch(resultados, termoFormatado);
    } else {
      router.push(`/search?q=${encodeURIComponent(termoFormatado)}`);
      setNomePersonagem("");
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.campoPesquisar}>
        <form onSubmit={handleSubmit}>
          <div className={styles.campoPesquisarContainer}>
            <input 
              type="text" 
              value={nomePersonagem} 
              onChange={(e) => setNomePersonagem(e.target.value)} 
              placeholder="Procurar personagem" 
              className={styles.input}
              disabled={searchLoading}
            />
            <button 
              type="submit" 
              className={styles.botaoPesquisar}
              disabled={searchLoading}
              aria-label="Pesquisar"
            >
              <FiSearch />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default SearchBar;