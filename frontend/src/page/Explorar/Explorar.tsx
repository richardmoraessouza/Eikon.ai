import { useRef } from 'react';
import styles from './Explorar.module.css';
import { useAuth } from "../../hooks/AuthContext/AuthContext";
import { useNavigate } from 'react-router-dom';
import CampoDePesquisar from '../../components/CampoDePesquisar/CampoDePesquisar';
import { usePersonagensUsuario } from '../../hooks/UserPerson/UserPerson';
import PopularWeek from '../../components/PopularWeek/PopularWeek';

interface Personagem {
    id: number;
    nome: string;
    nome_criador: string;
    bio?: string;
    fotoia?: string;
    likes?: number;
    curtidoPeloUsuario?: boolean;
    favoritadoPeloUsuario?: boolean;
    popular?: boolean;
    destaque?: boolean;
}

function Carrossel({ titulo, personagens, onLike, onFavorito, onNav }: {
    titulo: string;
    personagens: Personagem[];
    onLike: (e: React.MouseEvent, id: number) => void;
    onFavorito: (e: React.MouseEvent, id: number) => void;
    onNav: (id: number) => void;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scroll = (dir: number) => {
        scrollRef.current?.scrollBy({ left: dir * 330, behavior: 'smooth' });
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.titleBar} />
                    {titulo}
                </h2>
                <button className={styles.seeAll}>Ver tudo →</button>
            </div>

            <div className={styles.carouselWrap}>
                <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={() => scroll(-1)} aria-label="Anterior">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div className={styles.carousel} ref={scrollRef}>
                    {personagens.map(p => (
                        <article key={p.id} className={styles.ccard} onClick={() => onNav(p.id)}>
                            <div className={styles.ccardImg}>
                                <img
                                    src={p.fotoia || '/image/semPerfil.jpg'}
                                    alt={p.nome}
                                    className={styles.ccardImgEl}
                                />
                                <div className={styles.ccardOverlay} />
                                <div className={styles.ccardMsgs}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5v-5a3 3 0 0 1-3-3V5z" />
                                    </svg>
                                    {p.likes ?? 0}
                                </div>
                            </div>
                            <div className={styles.ccardInfo}>
                                <div className={styles.ccardName}>{p.nome}</div>
                                <div className={styles.ccardCreator}>@{p.nome_criador}</div>
                            </div>
                        </article>
                    ))}
                </div>

                <button className={`${styles.navBtn} ${styles.navRight}`} onClick={() => scroll(1)} aria-label="Próximo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function Grid4({ titulo, personagens, onNav }: {
    titulo: string;
    personagens: Personagem[];
    onNav: (id: number) => void;
}) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.titleBar} />
                    {titulo}
                </h2>
                <button className={styles.seeAll}>Ver tudo →</button>
            </div>

            <div className={styles.grid4}>
                {personagens.map(p => (
                    <article key={p.id} className={styles.gcard} onClick={() => onNav(p.id)}>
                        <img
                            className={styles.gcardImg}
                            src={p.fotoia || '/image/semPerfil.jpg'}
                            alt={p.nome}
                        />
                        <div className={styles.gcardInfo}>
                            <div className={styles.gcardName}>{p.nome}</div>
                            <div className={styles.gcardCreator}>@{p.nome_criador}</div>
                            <div className={styles.gcardFooter}>
                                <span className={styles.gcardStat}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    {p.likes ?? 0}
                                </span>
                                <span className={styles.gcardStat}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5v-5a3 3 0 0 1-3-3V5z" />
                                    </svg>
                                    0
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

function FeedLista({ titulo, personagens, onLike, onFavorito, onNav }: {
    titulo: string;
    personagens: Personagem[];
    onLike: (e: React.MouseEvent, id: number) => void;
    onFavorito: (e: React.MouseEvent, id: number) => void;
    onNav: (id: number) => void;
}) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.titleBar} />
                    {titulo}
                </h2>
            </div>
            <div className={styles.feedList}>
    {personagens.map(p => (
        <article key={p.id} className={styles.gcard} onClick={() => onNav(p.id)}>
            <img
                className={styles.gcardImg}
                src={p.fotoia || '/image/semPerfil.jpg'}
                alt={p.nome}
            />
            <div className={styles.gcardInfo}>
                <div className={styles.gcardName}>{p.nome}</div>
                <div className={styles.gcardCreator}>@{p.nome_criador}</div>
                <div className={styles.gcardFooter}>
                    <button
                        className={`${styles.faction} ${p.curtidoPeloUsuario ? styles.liked : ''}`}
                        onClick={(e) => onLike(e, p.id)}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24"
                            fill={p.curtidoPeloUsuario ? "#ff5177" : "none"}
                            stroke={p.curtidoPeloUsuario ? "#ff5177" : "currentColor"}
                            strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        {p.likes ?? 0}
                    </button>

                    <button
                        className={`${styles.faction} ${p.favoritadoPeloUsuario ? styles.faved : ''}`}
                        onClick={(e) => onFavorito(e, p.id)}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24"
                            fill={p.favoritadoPeloUsuario ? "#FFD700" : "none"}
                            stroke={p.favoritadoPeloUsuario ? "#FFD700" : "currentColor"}
                            strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    ))}
</div>
        </div>
    );
}

function BuscarPersonagem() {
    const navigate = useNavigate();
    const { usuarioId, token } = useAuth();
    const { personagens, like, favorito, loading } = usePersonagensUsuario(usuarioId, token);

    const handleToggleLike = async (e: React.MouseEvent, personagem_id: number) => {
        e.stopPropagation();
        if (!usuarioId) { navigate('/entrar'); return; }
        try { await like(personagem_id); }
        catch (err) { console.error('Erro no toggle like:', err); }
    };

    const handleToggleFavorito = async (e: React.MouseEvent, personagem_id: number) => {
        e.stopPropagation();
        if (!usuarioId) { navigate('/entrar'); return; }
        if (!token || token.trim() === '') { navigate('/entrar'); return; }
        try {
            await favorito(personagem_id);
            localStorage.setItem('favoritos_updated', Date.now().toString());
            try {
                const next = personagens.map(p =>
                    p.id === personagem_id ? { ...p, favoritadoPeloUsuario: !p.favoritadoPeloUsuario } : p
                );
                const ids = next.filter(n => n.favoritadoPeloUsuario).map(n => n.id);
                if (usuarioId) localStorage.setItem(`favoritos_${usuarioId}`, JSON.stringify(ids));
            } catch { /* ignore */ }
        } catch (err: any) {
            console.error('Erro no toggle favorito:', err);
            if (err?.response?.status === 401) navigate('/entrar');
        }
    };

    const populares = personagens.filter(p => p.popular);
    const destaques = personagens.filter(p => p.destaque);
    const carPopular = populares.length ? populares : personagens.slice(0, 8);
    const carDestaq  = destaques.length ? destaques : personagens.slice(0, 6);
    const grid4      = personagens.slice(0, 4);

    return (
        <main className={styles.container}>
            <header>
                <CampoDePesquisar />
            </header>

            {loading ? (
                <div className={styles.loader}>Carregando personagens...</div>
            ) : (
                <div className={styles.page}>
                    <Carrossel
                        titulo="🔥 Popular"
                        personagens={carPopular}
                        onLike={handleToggleLike}
                        onFavorito={handleToggleFavorito}
                        onNav={(id) => navigate(`/personagem/${id}`)}
                    />

                    <Carrossel
                        titulo="⭐ Em destaque"
                        personagens={carDestaq}
                        onLike={handleToggleLike}
                        onFavorito={handleToggleFavorito}
                        onNav={(id) => navigate(`/personagem/${id}`)}
                    />

                    <Grid4
                        titulo="Recentes"
                        personagens={grid4}
                        onNav={(id) => navigate(`/personagem/${id}`)}
                    />

                    <FeedLista
                        titulo="Todos os personagens"
                        personagens={personagens}
                        onLike={handleToggleLike}
                        onFavorito={handleToggleFavorito}
                        onNav={(id) => navigate(`/personagem/${id}`)}
                    />
                </div>
            )}

            <PopularWeek />
        </main>
    );
}

export default BuscarPersonagem;