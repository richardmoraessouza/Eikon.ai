import { useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './SearchResults.module.css';
import CampoDePesquisar from '../../components/SearchBar/SearchBar';
import ExploreSections from '../../components/ExploreSections/ExploreSections';
import { CharacterSearch } from '../../components/CharacterSearch/CharacterSearch';
import { useCharacters } from '../../hooks/useCharacters/useCharacters';
import type { Character } from '../../types/characters/characters';

function SearchResults() {
    const location = useLocation();
    const {
        searchResults,
        searchLoading,
        searchHasMore,
        searchCharacterByName,
        loadMoreSearchResults,
        seedSearchResults
    } = useCharacters();

    const [termoPesquisa, setTermoPesquisa] = useState<string>('');
    const [creatorsMap, setCreatorsMap] = useState<Record<number, string>>({});
    const [categoriaAtiva, setCategoriaAtiva] = useState<string>('');

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Refaz a busca no backend (nome + tag) sempre que a tag selecionada mudar — sempre reseta a paginação
    const refazerBusca = useCallback(async (nome: string, tag: string) => {
        if (!nome) return;
        await searchCharacterByName(nome, tag);
    }, [searchCharacterByName]);

    // Captura resultados iniciais quando a busca vem de outra página (Home / Sidebar)
    useEffect(() => {
        if (location.state?.resultados) {
            const termo = location.state.termoOriginal || '';
            seedSearchResults(location.state.resultados, termo, '');
            setTermoPesquisa(termo);
            setCategoriaAtiva('');
            window.scrollTo(0, 0);
        }
    }, [location.state]);

    // Sempre que a tag mudar (com um termo já ativo), refaz a busca com nome + tag
    useEffect(() => {
        if (termoPesquisa) {
            refazerBusca(termoPesquisa, categoriaAtiva);
        }
    }, [categoriaAtiva, termoPesquisa, refazerBusca]);

    // Busca nova digitada no SearchBar — usa o termo que ele já manda, sem ler o DOM
    const handleNovasBuscas = (novosResultados: Character[], termo: string) => {
        seedSearchResults(novosResultados, termo, '');
        setTermoPesquisa(termo);
        setCategoriaAtiva(''); // volta pro "Todos" — mostra todos os tipos do nome buscado
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

export default SearchResults;