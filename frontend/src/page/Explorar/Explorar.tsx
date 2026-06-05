import CampoDePesquisar from '../../components/CampoDePesquisar/CampoDePesquisar';
import CardExplore from '../../components/CardExplore/CardExplore';
import ExploreSections from '../../components/ExploreSections/ExploreSections';
import { HeroBanner } from '../../components/HeroBanner/HeroBanner';
import PopularWeek from '../../components/PopularWeek/PopularWeek';

import styles from './Explorar.module.css';

const Explorar = () => {
    return (
        <main className={styles.explorarContainer}>
            <CampoDePesquisar />
            <div className={styles.espaco}></div>
            <HeroBanner />
            <PopularWeek/>
            <CardExplore />
            <ExploreSections />
        </main>
    )
}

export default Explorar;