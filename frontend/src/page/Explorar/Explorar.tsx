import CampoDePesquisar from '../../components/CampoDePesquisar/CampoDePesquisar';
import CardExplore from '../../components/CardExplore/CardExplore';
import ExploreSections from '../../components/ExploreSections/ExploreSections';
import PopularWeek from '../../components/PopularWeek/PopularWeek';

import styles from './Explorar.module.css';

const Explorar = () => {
    return (
        <main className={styles.explorarContainer}>
            <CampoDePesquisar />
            <PopularWeek/>
            <CardExplore />
            <ExploreSections />
        </main>
    )
}

export default Explorar;