import { FiTrendingUp, FiStar } from 'react-icons/fi'; 
import CampoDePesquisar from '../../components/CampoDePesquisar/CampoDePesquisar';
import CardExplore from '../../components/CardExplore/CardExplore';
import ExploreSections from '../../components/ExploreSections/ExploreSections';
import { HeroBanner } from '../../components/HeroBanner/HeroBanner';
import { DiscoveryCards } from '../../components/discoveryCards/discoveryCards ';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useDiscovery, useRecommendations } from '../../hooks/useDiscovery/useDiscovety';

import styles from './Explorar.module.css';

const Explorar = () => {
    const { usuarioId: usuarioLogadoId } = useAuth();
    const popularData = useDiscovery();
    
    const { 
        characters: recCharacters, 
        loading: recLoading, 
        error: recError, 
        hasMore: recHasMore, 
        fetchNextPage: recFetchNextPage 
    } = useRecommendations(usuarioLogadoId || 0);

    return (
        <main className={styles.explorarContainer}>
            <CampoDePesquisar />
            <div className={styles.espaco}></div>
            <HeroBanner />
            
            <CardExplore />
            
            <div className={styles.containerDiscovery}>
                <DiscoveryCards 
                    title="Populares da Semana"
                    icon={<FiTrendingUp />}
                    characters={popularData.characters}
                    loading={popularData.loading}
                    error={popularData.error}
                    showRank={true}
                    emptyMessage="Nenhum personagem popular esta semana."
                />

                <DiscoveryCards 
                    title="Recomendados Para Você"
                    icon={<FiStar />} 
                    characters={recCharacters}
                    loading={recLoading}
                    error={recError}
                    showRank={false}
                    onLoadMore={recFetchNextPage} 
                    hasMore={recHasMore}
                    emptyMessage="Converse com mais bots para podermos personalizar suas recomendações!"
                />
            </div>
            
            <ExploreSections />
        </main>
    );
};

export default Explorar;