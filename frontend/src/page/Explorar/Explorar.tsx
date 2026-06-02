import CampoDePesquisar from '../../components/CampoDePesquisar/CampoDePesquisar';
import CardExplore from '../../components/CardExplore/CardExplore';
import PopularWeek from '../../components/PopularWeek/PopularWeek';
import styles from './Explorar.module.css';

const Explorar = () => {
    return (
        <main className={styles.explorarContainer}>
            <CampoDePesquisar />
            <PopularWeek/>
            <CardExplore />
        </main>
    )
}

export default Explorar;