'use client';

import { FiTrendingUp, FiStar } from 'react-icons/fi'; 
import SearchBar from '../navigation/SearchBar/SearchBar';
import CardExplore from '../character/CardExplore/CardExplore';
import ExploreSections from '../character/ExploreSections/ExploreSections';
import { HeroBanner } from '../character/HeroBanner/HeroBanner';
import { DiscoveryCards } from '../character/discoveryCards/discoveryCards ';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { useDiscovery, useRecommendations } from '../../hooks/useDiscovery/useDiscovety';
import styles from './Explorar.module.css';
import Footer from '../footer-links/Footer/Footer';
import PaymentModal from '../PaymentModal/PaymentModal';

const Explorar = () => {
    const { usuarioId: usuarioLogadoId } = useAuth();
    const popularData = useDiscovery();

    const popularCharacters = popularData.characters.map((character) => ({
        ...character,
        public_id: character.public_id ?? String(character.id),
    }));
    
    const { 
        characters: recCharacters, 
        loading: recLoading, 
        error: recError, 
        hasMore: recHasMore, 
        fetchNextPage: recFetchNextPage 
    } = useRecommendations(usuarioLogadoId || 0);

    return (
        <main className={styles.explorarContainer}>
            <SearchBar />
            <div className={styles.espaco}></div>
            <HeroBanner />
            <CardExplore />
            
            <div className={styles.containerDiscovery}>
                <DiscoveryCards 
                    title="Populares da Semana"
                    icon={<FiTrendingUp />}
                    characters={popularCharacters}
                    loading={popularData.loading}
                    error={popularData.error}
                    emptyMessage="Nenhum personagem popular esta semana."
                />

                <DiscoveryCards 
                    title="Recomendados Para Você"
                    icon={<FiStar />} 
                    characters={recCharacters}
                    loading={recLoading}
                    error={recError}
                    onLoadMore={recFetchNextPage} 
                    hasMore={recHasMore}
                    emptyMessage="Converse com mais bots para podermos personalizar suas recomendações!"
                />
            </div>

            
            <ExploreSections router='explore'/>
            <Footer />
        </main>
    );
};

export default Explorar;