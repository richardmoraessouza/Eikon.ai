import { useEffect, useState, useRef } from 'react';
import styles from './Menu.module.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { buscarPersonagensRecentes } from '../../services/personagemService';

interface MenuProps {
    setPersonId?: React.Dispatch<React.SetStateAction<number>>;
    onMenuToggle?: (isOpen: boolean) => void;
}

function Menu({ setPersonId, onMenuToggle }: MenuProps) {
    const { usuario, fotoPerfil, estaLogado, logout, usuarioId, token } = useAuth();
    const [recentes, setRecentes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [abrirConta, setAbrirConta] = useState<boolean>(false);
    const [modalOpen, setModaOpen] = useState<boolean>(true);
    const [procurarPersonagem, setProcurarPersonagem] = useState<string>('');

    const modalRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Filtra os personagens recentes com base no que o usuário digita na busca
    const personagensRecentesFiltrados = recentes.filter((personagem) => {
        if (!personagem || !personagem.nome) return false;
        return personagem.nome.toLocaleLowerCase().includes(procurarPersonagem.toLocaleLowerCase());
    });

    useEffect(() => {
        if (onMenuToggle) onMenuToggle(modalOpen);
    }, [modalOpen, onMenuToggle]);

    function sairDaConta() {
        logout();
        setAbrirConta(false);
    }

    function sobreConta() {
        setAbrirConta(prev => !prev);
    }

    function modalCondicao() {
        setModaOpen(prev => !prev);
    }

    function closeMenuOnMobile() {
        if (window.innerWidth <= 768) {
            setModaOpen(false);
        }
    }

    // Recarregar personagens recentesquando usuário faz login ou logout
    useEffect(() => {
        if (estaLogado && usuarioId && token) {
            setLoading(true);
            buscarPersonagensRecentes(usuarioId)
                .then((recentes) => {
                    setRecentes(recentes || []);
                })
                .catch((err) => {
                    console.error("Erro ao buscar os últimos personagens:", err);
                    setRecentes([]);
                })
                .finally(() => setLoading(false));
        } else {
            setRecentes([]);
        }
    }, [usuarioId, estaLogado, token]);


    // Fecha o menu em mobile quando a rota muda (ao clicar em um personagem)
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setModaOpen(false);
        }
    }, [location.pathname]);

    // Fecha o menu ao clicar fora dele (mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth > 768) return;
            const target = event.target as Node;
            const clickedOutsideModal = modalRef.current && !modalRef.current.contains(target);
            const clickedMenuButton = buttonRef.current && buttonRef.current.contains(target);

            if (clickedOutsideModal && !clickedMenuButton) {
                setModaOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <button ref={buttonRef} onClick={modalCondicao} className={styles.btnMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {modalOpen && (
                <aside ref={modalRef} className={`fixed top-0 left-0 p-4 ${styles.menu}`}>
                    <h1>
                        <a href="/explorar" onClick={closeMenuOnMobile} className='flex justify-center items-center w-full'>
                            <img src="/image/PersonIA.png" alt="PersonIA" className={styles.logo} />
                        </a>
                    </h1>

                    {/* criação e explorar */}
                    <section>
                        <h2 className={styles.subTitulo}>Criação</h2>
                        <nav>
                            <ul className={styles.menuItems}>
                                <li><Link to={'/explorar'} onClick={closeMenuOnMobile}><i className="fa-solid fa-compass"></i>Buscar</Link></li>
                                <li><Link to={'/criacao-person'} state={{ tipo: 'ficcional' }} onClick={closeMenuOnMobile}><i className="fa-solid fa-masks-theater"></i> Criar personagem fictício</Link></li>
                                <li><Link to={'/criacao-person'} onClick={closeMenuOnMobile}><i className="fa-solid fa-user"></i> Criar personagem</Link></li>

                                {!estaLogado && (
                                    <>
                                        <li><Link to={'/entrar'} onClick={closeMenuOnMobile}><i className="fa-solid fa-right-to-bracket"></i> Entrar</Link></li>
                                        <li><Link to={'/cadastra'} onClick={closeMenuOnMobile}><i className="fa-solid fa-user-plus"></i> Cadastrar</Link></li>
                                    </>
                                )}
                            </ul>
                        </nav>
                    </section>

                    <hr className={styles.separacaoCriacao} />
                    
                    <div className={styles.containerBusca}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            onChange={(e) => setProcurarPersonagem(e.target.value)}
                            placeholder="Procurar" 
                            className={styles.inputProcurar} 
                        />
                    </div>

                    {/* mostra personagens recentes do usuario */}
                    <section>
                        <h2 className={styles.subTitulo}>Recentes</h2>
                        <ul className={`${styles.menuItems} ${styles.containerPerson}`}>
                            {loading ? (
                                <div className={styles.loaderContainer}>
                                    <div className={styles.spinner}></div>
                                    <p>Carregando...</p>
                                </div>
                            ) : personagensRecentesFiltrados.length > 0 ? (
                                personagensRecentesFiltrados.map((item) => {
                                    // Verifica se item é um objeto com dados ou apenas um ID numérico
                                    const itemId = typeof item === 'number' ? item : item?.id;
                                    const itemNome = typeof item === 'string' || typeof item === 'number' ? `Personagem ${itemId}` : item?.nome || `Personagem ${itemId}`;
                                    const itemFoto = typeof item === 'string' || typeof item === 'number' ? '/image/semPerfil.jpg' : item?.fotoia || '/image/semPerfil.jpg';
                                    
                                    return (
                                        <li key={itemId}>
                                            <Link
                                                to={`/personagem/${itemId}`}
                                                className="w-full flex items-center gap-2 p-1 hover:bg-[#2a2a2a] rounded transition-colors"
                                                onClick={() => {
                                                    setPersonId && setPersonId(itemId);
                                                    closeMenuOnMobile();
                                                }}
                                            >
                                                <img
                                                    src={itemFoto}
                                                    alt={itemNome}
                                                    className='w-7 h-7 rounded-full object-cover'
                                                />
                                                <p className={styles.nomePersonagem}>{itemNome}</p>
                                            </Link>
                                        </li>
                                    );
                                })
                            ) : (
                                <li>
                                    <p className='text-center text-sm text-gray-400 p-4'>
                                        {estaLogado ? "Nenhum personagem recente encontrado." : "Entre para ver seus personagens recentes!"}
                                    </p>
                                </li>
                            )}
                        </ul>
                    </section>

                    <section>
                        <div
                            onClick={sobreConta}
                            className={`absolute bottom-0 left-0 p-11 w-full cursor-pointer ${styles.containerConta}`}
                        >
                            <div className={styles.person}>
                                {estaLogado ? (
                                    <div className='flex flex-row items-center gap-2'>
                                        <img
                                            src={fotoPerfil || '/image/semPerfil.jpg'}
                                            alt='Perfil'
                                            className='w-9 h-9 rounded-full object-cover'
                                        />
                                        <p className='truncate w-48'>{usuario}</p>
                                    </div>
                                ) : (
                                    <div className='flex flex-row items-center gap-2'>
                                        <img
                                            src="/image/semPerfil.jpg"
                                            alt="Visitante"
                                            className='w-9 h-9 rounded-full object-cover'
                                        />
                                        <p>visitante</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* abre o sair e ver perfil da conta */}
                        {abrirConta && (
                            <nav className={`absolute bottom-20 left-0 w-full ${styles.navegacaoConta}`}>
                                <ul className={styles.items}>
                                    {estaLogado ? (
                                        <>
                                            <li><Link to={`/perfil/${usuarioId}`} onClick={closeMenuOnMobile}><i className="fa-solid fa-user"></i> Perfil</Link></li>
                                            <hr className={styles.separacaoConta} />
                                            <li onClick={() => {
                                                sairDaConta();
                                                closeMenuOnMobile();
                                            }} className="cursor-pointer">
                                                <i className="fa-solid fa-right-from-bracket"></i> Sair
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li><Link to={'/entrar'} onClick={closeMenuOnMobile}><i className="fa-solid fa-right-to-bracket"></i> Entrar</Link></li>
                                            <hr className={styles.separacaoConta} />
                                            <li><Link to={'/cadastra'} onClick={closeMenuOnMobile}><i className="fa-solid fa-user-plus"></i> Cadastrar</Link></li>
                                        </>
                                    )}
                                </ul>
                            </nav>
                        )}
                    </section>
                </aside>
            )}
        </>
    );
}

export default Menu;