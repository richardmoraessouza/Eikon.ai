import { useEffect, useState, useRef } from 'react';
import styles from './Menu.module.css';
import { FiSearch, FiPlusCircle, FiUserPlus, FiLogIn, FiLogOut, FiSettings, FiUser} from "react-icons/fi";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { normalizeFrame } from '../../utils/frame';
import { buscarPersonagensRecentes } from '../../services/personagemService';
import SettingsModal from '../SettingsModal/SettingsModal';

interface MenuProps {
    setPersonId?: React.Dispatch<React.SetStateAction<number>>;
    onMenuToggle?: (isOpen: boolean) => void;
}

function Menu({ setPersonId, onMenuToggle }: MenuProps) {
    const { usuario, fotoPerfil, estaLogado, logout, usuarioId, token, frame } = useAuth();
    const [recentes, setRecentes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [abrirConta, setAbrirConta] = useState<boolean>(false);
    const [modalOpen, setModaOpen] = useState<boolean>(true);
    const [procurarPersonagem, setProcurarPersonagem] = useState<string>('');

    const frameAtivo = normalizeFrame(frame);
    const caminhoFrame = frameAtivo ? `/image/frames/${frameAtivo}` : null;

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

    // Recarregar personagens recentes quando usuário faz login ou logout
    useEffect(() => {
        if (estaLogado && usuarioId && token) {
            setLoading(true);
            buscarPersonagensRecentes(usuarioId, token)
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
            
            <SettingsModal isOpen={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />

            {modalOpen && (
                <aside ref={modalRef} className={`fixed top-0 left-0 p-4 ${styles.menu}`}>
                    <h1>
                        <a href="/explorar" onClick={closeMenuOnMobile} className='flex justify-center items-center w-full'>
                            <img src="/image/darkEikon.png" alt="Eikon.ai" className={`${styles.logo} ${styles.darkLogo}`} />
                        </a>

                        <a href="/explorar" onClick={closeMenuOnMobile} className='flex justify-center items-center w-full'>
                            <img src="/image/lightEikon.png" alt="Eikon.ai" className={`${styles.logo} ${styles.lightLogo}`} />
                        </a>
                    </h1>

                    {/* criação e explorar */}
                    <section>
                        <h2 className={styles.subTitulo}>Criação</h2>
                        <nav>
                            <ul className={styles.menuItems}>
                                <li><Link to={'/explorar'} onClick={closeMenuOnMobile}><FiSearch /> Buscar</Link></li>
                                <li><Link to={'/create-character'} onClick={closeMenuOnMobile}><FiPlusCircle /> Criar personagem</Link></li>

                                {!estaLogado && (
                                    <>
                                        <li><Link to={'/entrar'} onClick={closeMenuOnMobile}><FiLogIn /> Entrar</Link></li>
                                        <li><Link to={'/cadastra'} onClick={closeMenuOnMobile}><FiUserPlus /> Cadastrar</Link></li>
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
                                Array.from({ length: 4 }).map((_, index) => (
                                    <li key={`recent-skeleton-${index}`} className="flex items-center gap-2 p-1">
                                        <div className={`${styles.skeletonAvatar} ${styles.skeletonCircle}`} />
                                        <div className={styles.skeletonNameRow} style={{ width: index % 2 === 0 ? '60%' : '45%' }} />
                                    </li>
                                ))
                            ) : personagensRecentesFiltrados.length > 0 ? (
                                personagensRecentesFiltrados.map((item) => {
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
                                        <div className={styles.avatarWrapper}>
                                        <img
                                            src={fotoPerfil || '/image/semPerfil.jpg'}
                                            alt='Perfil'
                                            className={styles.avatarMenu}
                                        />
                                        {caminhoFrame && (
                                            <img
                                            src={caminhoFrame}
                                            alt="Frame"
                                            className={styles.frameMenu}
                                            />
                                        )}
                                        </div>
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
                                            <li className={styles.navItem}>
                                                <Link to={`/perfil/${usuarioId}`} onClick={closeMenuOnMobile} className={styles.navLink}>
                                                    <FiUser />
                                                    <span>Perfil</span>
                                                </Link>
                                            </li>

                                            <li className={styles.navItem}>
                                                <button onClick={() => setSettingsModalOpen(true)} className={styles.navLink}>
                                                     <FiSettings />
                                                    <span>Configurações</span>
                                                </button>
                                            </li>
                                            
                                            <li className={styles.navItem}>
                                                <button onClick={() => {
                                                    sairDaConta();
                                                    closeMenuOnMobile();
                                                }} className={styles.navLink}>
                                                    <FiLogOut />
                                                    <span>Sair</span>
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className={styles.navItem}>
                                                <Link to={'/entrar'} onClick={closeMenuOnMobile} className={styles.navLink}>
                                                    <FiLogIn />
                                                    <span>Entrar</span>
                                                </Link>
                                            </li>

                                            <li className={styles.navItem}>
                                                <Link to={'/cadastra'} onClick={closeMenuOnMobile} className={styles.navLink}>
                                                    <FiUserPlus />
                                                    <span>Cadastrar</span>
                                                </Link>
                                            </li>
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