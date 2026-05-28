import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './PersonagemPesquisado.module.css';
import CampoDePesquisar from '../../components/CampoDePesquisar/CampoDePesquisar';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    buscarLikesUsuario,
    buscarFavoritosUsuario,
    buscarQuantidadeLikes,
    toggleLike as apiToggleLike,
    toggleFavorito as apiToggleFavorito,
    buscarNomeCriador,
} from '../../services/personagemService';

function PersonagemPesquisado() {
    const location = useLocation();
    const [resultados, setResultados] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [favoritedIds, setFavoritedIds] = useState<number[]>([]);
    const [likesCount, setLikesCount] = useState<Record<number, number>>({});
    const { usuarioId, token, estaLogado } = useAuth();
    const [creatorsMap, setCreatorsMap] = useState<Record<number, string>>({});

    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.resultados) {
            setResultados(location.state.resultados);
            window.scrollTo(0, 0);
        }
    }, [location.state?.resultados]);

    const handleNovasBuscas = (novosResultados: any[]) => {
        setResultados(novosResultados);
        setIsLoading(false);
        window.scrollTo(0, 0);
        
        if (novosResultados.length === 0) {
            console.log("❌ Nenhum personagem encontrado");
        } else {
            console.log(`✅ ${novosResultados.length} personagem(ns) encontrado(s)`);
        }
    }

    const handleSearchStart = () => {
        setIsLoading(true);
    }

    const toggleLike = (id: number) => {
        if (!usuarioId || !token) {
            console.log('Usuário não logado - redirecionar para login ou avisar');
            return;
        }

        const alreadyLiked = likedIds.includes(id);

        setLikedIds(prev => alreadyLiked ? prev.filter(x => x !== id) : [...prev, id]);
        setLikesCount(prev => ({ ...prev, [id]: (prev[id] || 0) + (alreadyLiked ? -1 : 1) }));

        (async () => {
            try {
                await apiToggleLike(usuarioId, id, token);
            } catch (err) {
                // Reverter em caso de erro
                setLikedIds(prev => alreadyLiked ? [...prev, id] : prev.filter(x => x !== id));
                setLikesCount(prev => ({ ...prev, [id]: (prev[id] || 0) + (alreadyLiked ? 1 : -1) }));
                console.error('Erro ao alternar like', err);
            }
        })();
    }

    const toggleFavorite = (id: number) => {
        if (!usuarioId || !token || token.trim() === '') {
            console.log('Usuário não logado - redirecionar para login ou avisar');
            navigate('/entrar');
            return;
        }

        const alreadyFav = favoritedIds.includes(id);
        setFavoritedIds(prev => alreadyFav ? prev.filter(x => x !== id) : [...prev, id]);

        // Notificar que os favoritos foram atualizados
        localStorage.setItem('favoritos_updated', Date.now().toString());

        (async () => {
            try {
                await apiToggleFavorito(usuarioId, id, token);
            } catch (err: any) {
                setFavoritedIds(prev => alreadyFav ? [...prev, id] : prev.filter(x => x !== id));
                console.error('Erro ao alternar favorito', err);
                
                // Se for erro 401 (Unauthorized), redirecionar para login
                if (err?.response?.status === 401) {
                    console.warn('Token expirado ou inválido');
                    navigate('/entrar');
                }
            }
        })();
    }

    // Carregar likes/favoritos do usuário e contagens de likes para os resultados
    useEffect(() => {
        let mounted = true;
        const loadMeta = async () => {
            if (!resultados || resultados.length === 0) return;

            try {
                // buscar contagens de likes para cada personagem
                const counts = await Promise.all(resultados.map(r => buscarQuantidadeLikes(r.id).catch(() => 0)));
                if (!mounted) return;
                const map: Record<number, number> = {};
                resultados.forEach((r, i) => map[r.id] = counts[i] || 0);
                setLikesCount(map);

                // se usuário está logado, buscar seus likes e favoritos
                if (estaLogado && usuarioId && token) {
                    const [userLikes, userFavs] = await Promise.all([
                        buscarLikesUsuario(usuarioId, token).catch(() => []),
                        buscarFavoritosUsuario(usuarioId).catch(() => []),
                    ]);
                    if (!mounted) return;
                    setLikedIds(userLikes || []);
                    setFavoritedIds(userFavs || []);
                } else {
                    setLikedIds([]);
                    setFavoritedIds([]);
                }
            } catch (err) {
                console.error('Erro ao carregar metadados dos personagens', err);
            }
        }

        loadMeta();
        return () => { mounted = false; }
    }, [resultados, estaLogado, usuarioId, token]);

    // Buscar nomes dos criadores quando não estiverem presentes no objeto do personagem
    useEffect(() => {
        let mounted = true;
        const loadCreators = async () => {
            if (!resultados || resultados.length === 0) return;

            // coletar ids de usuário únicos que ainda não temos no mapa e que existem no resultado
            const userIds = Array.from(new Set(
                resultados
                    .map((r: any) => {
                        // vários formatos diferentes possíveis
                        if (r.usuario_id) return Number(r.usuario_id);
                        if (r.usuarioId) return Number(r.usuarioId);
                        if (r.user_id) return Number(r.user_id);
                        if (r.criador_id) return Number(r.criador_id);
                        if (r.usuario && typeof r.usuario === 'number') return Number(r.usuario);
                        if (r.usuario && typeof r.usuario === 'object' && (r.usuario.id || r.usuario._id)) return Number(r.usuario.id || r.usuario._id);
                        return undefined;
                    })
                    .filter((id) => id !== undefined && id !== null && !creatorsMap[id])
            ));

            if (userIds.length === 0) return;

            try {
                const promises = userIds.map((uid: any) => buscarNomeCriador(Number(uid), token || null).catch(() => 'Desconhecido'));

                const names = await Promise.all(promises);
                if (!mounted) return;
                const newMap: Record<number, string> = { ...creatorsMap };
                userIds.forEach((uid: any, i) => {
                    newMap[Number(uid)] = names[i] || 'Desconhecido';
                });
                setCreatorsMap(newMap);
            } catch (err) {
                console.error('Erro ao buscar nomes dos criadores', err);
            }
        }

        loadCreators();
        return () => { mounted = false; };
    }, [resultados, token]);

    return (
        <main className={styles.container}>
            <CampoDePesquisar onSearch={handleNovasBuscas} onSearchStart={handleSearchStart} />
            {/* <div className={styles.buttonsContainer}>
                <button className={styles.activeButton}>Personagens</button>
                <button className={styles.inactiveButton}>Criadores</button>
            </div> */}

            {isLoading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
                
            ) : resultados.length > 0 ? (
                <>
                    <article className={styles.gridCards} >
                        {resultados.map((personagem: any) => (
                            <div key={personagem.id} className={styles.card} onClick={() => navigate(`/personagem/${personagem.id}`)}>
                                <div className={styles.cardImageContainer}>
                                    {personagem.fotoia ? (
                                        <img 
                                            src={personagem.fotoia} 
                                            alt={personagem.nome} 
                                            className={styles.cardImage}
                                        />
                                    ) : (
                                        <div>
                                            <img src="/image/semPerfil.jpg" alt="Sem imagem de perfil" className={styles.cardImage} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardContent}>
                                    <div>
                                        <h3 className={styles.cardNome}>
                                            {personagem.nome}
                                            <span className={styles.linkIcon}>↗</span>
                                        </h3>
                                        <p className={styles.cardBio}>
                                            {personagem.bio || 'Sem descrição bio'}
                                        </p>
                                    </div>

                                    <div className={styles.cardMeta}>
                                        <div className={styles.creator}>
                                            Criado por: {
                                                // prefer explicit nome_criador field, then creatorsMap by id, then common fields
                                                personagem.nome_criador
                                                || creatorsMap[ Number(personagem.usuario_id ?? personagem.usuarioId ?? personagem.user_id ?? (personagem.usuario && (typeof personagem.usuario === 'number' ? personagem.usuario : (personagem.usuario.id || personagem.usuario._id)))) ]
                                                || personagem.criador
                                                || (personagem.usuario && (typeof personagem.usuario === 'string' ? personagem.usuario : (personagem.usuario.nome || personagem.usuario.name)))
                                                || personagem.autor
                                                || 'Desconhecido'
                                            }
                                        </div>

                                        <div className={styles.interactions}>
                                            {/* Like (heart) - estilo igual ao CardUsuario */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLike(personagem.id); }}
                                                className={`${styles.likeButton} ${likedIds.includes(personagem.id) ? styles.active : ''}`}
                                            >
                                                <span>{likesCount[personagem.id] ?? 0}</span>
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill={likedIds.includes(personagem.id) ? "#ff4b4b" : "none"}
                                                    stroke={likedIds.includes(personagem.id) ? "#ff4b4b" : "currentColor"}
                                                    strokeWidth="2"
                                                >
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                </svg>
                                            </button>

                                            {/* Comentário (apenas visual, mantém comportamento parecido com CardUsuario) */}
                                            <button className={styles.commentButton} onClick={(e) => e.stopPropagation()}>
                                                <span>0</span>
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    >
                                                    <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5v-5a3 3 0 0 1-3-3V5z"/>
                                                    <line x1="8" y1="8" x2="16" y2="8"/>
                                                    <line x1="8" y1="12" x2="13" y2="12"/>
                                                </svg> 
                                            </button>

                                            {/* Favorito (estrela) */}
                                            <button
                                                className={styles.favorito}
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(personagem.id); }}
                                            >
                                                <i
                                                    className={`fa ${favoritedIds.includes(personagem.id) ? 'fa-solid fa-star' : 'fa-regular fa-star'}`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        color: favoritedIds.includes(personagem.id) ? '#FFD700' : '#888'
                                                    }}
                                                ></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </article>
                </>
            ) : (
                <div className={styles.emptyMessageContainer}>
                    <CampoDePesquisar onSearch={handleNovasBuscas} onSearchStart={handleSearchStart} />
                    <div className={styles.emptyMessage}>
                        Nenhum personagem encontrado. Tente fazer uma busca!
                    </div>
                </div>
            )}
        </main>
    )
}

export default PersonagemPesquisado;