'use client'; // Necessário no Next.js (App Router) para gerenciar hooks, efeitos e IntersectionObserver

import { useSearchParams } from 'next/navigation'; // Substitui o useLocation().state para capturar parâmetros da URL
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import styles from './SearchResults.module.css';
import CampoDePesquisar from '../../navigation/SearchBar/SearchBar';
import ExploreSections from '../ExploreSections/ExploreSections';
import { CharacterSearch } from '../CharacterSearch/CharacterSearch';
import { useCharacters } from '../../../hooks/useCharacters/useCharacters';
import type { Character } from '../../../types/characters/characters';

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const queryTermo = searchParams.get('q') || '';

    const {
        searchResults,
        searchLoading,
        searchHasMore,
        searchCharacterByName,
        loadMoreSearchResults,
        seedSearchResults
    } = useCharacters();

    const [termoPesquisa, setTermoPesquisa] = useState<string>(queryTermo);
    const [creatorsMap, setCreatorsMap] = useState<Record<number, string>>({});
    const [categoriaAtiva, setCategoriaAtiva] = useState<string>('');

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Refaz a busca no backend (nome + tag) sempre que a tag selecionada mudar — sempre reseta a paginação
    const refazerBusca = useCallback(async (nome: string, tag: string) => {
        if (!nome) return;
        await searchCharacterByName(nome, tag);
    }, [searchCharacterByName]);

    // Captura o termo vindo da URL quando a página inicia ou muda
    useEffect(() => {
        if (queryTermo) {
            setTermoPesquisa(queryTermo);
            refazerBusca(queryTermo, categoriaAtiva);
            window.scrollTo(0, 0);
        }
    }, [queryTermo, categoriaAtiva, refazerBusca]);

    // Busca nova digitada no SearchBar
    const handleNovasBuscas = (novosResultados: Character[], termo: string) => {
        seedSearchResults(novosResultados, termo, '');
        setTermoPesquisa(termo);
        setCategoriaAtiva('');
        window.scrollTo(0, 0);
    };

    // Scroll infinito: quando o sentinel entra na tela, carrega mais 20
    useEffect(() => {
        if (!sentinelRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreSearchResults();
            }
        }, { rootMargin: '300px' });

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [loadMoreSearchResults]);

    return (
        <main className={styles.container}>
            <CampoDePesquisar onSearch={handleNovasBuscas} />

            <ExploreSections router="search" onTagChange={setCategoriaAtiva} />

            {searchLoading && searchResults.length === 0 ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            ) : searchResults.length > 0 ? (
                <>
                    <article className={styles.gridCards}>
                        {searchResults.map((personagem: any) => (
                            <CharacterSearch
                                key={personagem.id}
                                personagem={personagem}
                                creatorsMap={creatorsMap}
                                setCreatorsMap={setCreatorsMap}
                                isLoading={searchLoading}
                            />
                        ))}
                    </article>

                    {searchHasMore && (
                        <div ref={sentinelRef} className={styles.loadingContainer}>
                            {searchLoading && <div className={styles.spinner}></div>}
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.emptyMessageContainer}>
                    <div className={styles.emptyMessage}>
                        {categoriaAtiva
                          ? `Nenhum personagem correspondente a "${termoPesquisa}" encontrado na categoria selecionada.`
                          : "Nenhum personagem encontrado. Tente fazer uma busca!"
                        }
                    </div>
                </div>
            )}
        </main>
    );
}


export default function SearchResults() {
    return (
        <Suspense fallback={
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        }>
            <SearchResultsContent />
        </Suspense>
    );
}