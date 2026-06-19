import { FiMessageSquare, FiHeart, FiStar } from "react-icons/fi";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './CharacteProfile.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useCharacters } from '../../hooks/useCharacters/useCharacters';
import { useSocial } from '../../hooks/useSocial/useSocial';
import { useUsers } from "../../hooks/useUsers/useUsers";
import MiniProfile from "../MiniProfile/MiniProfile";

// Importações de serviço e tipo baseadas no DiscoveryCards
import { getMiniProfileService } from "../../services/users/userService";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../utils/frame";
import type { MiniProfileType } from "../../types/users/users";

interface ProfilePersonProps {
  personagemId: number | null;
  menuOpen: boolean;
  usuarioIdAtual: number | null;
  perfilPerson: boolean;
  setPerfilPerson: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfilePerson: React.FC<ProfilePersonProps> = ({ 
  personagemId,
  menuOpen,
  usuarioIdAtual, 
  perfilPerson,
  setPerfilPerson 
}) => {
  const { token, usuarioId } = useAuth();
  const { searchCharacterById } = useCharacters();
  
  const { 
    getQuantityLikes, 
    handleToggleLike, 
    handleToggleFavorite, 
    isLiked, 
    isFavorite 
  } = useSocial();
  
  const [personagem, setPersonagem] = useState<any>(null);
  const [status, setStatus] = useState<string>("Online");
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
  const [isLoadingFav, setIsLoadingFav] = useState<boolean>(false); 
  const navigate = useNavigate();

  const { users } = useUsers(personagem?.usuario_id);
  const nome = users[0];

  // --- ESTADOS E REFS PARA O MINIPROFILE EM HOVER ---
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeProfile, setActiveProfile] = useState<MiniProfileType | null>(null);
  const [showMiniProfile, setShowMiniProfile] = useState<boolean>(false);

  const loadMiniProfileData = useCallback(async (userId: number) => {
    try {
      const data = await getMiniProfileService(userId);
      setActiveProfile(data);
    } catch (err) {
      console.error("Erro ao carregar dados do mini perfil:", err);
    }
  }, []);

  // Escuta atualizações de moldura do MiniProfile
  useEffect(() => {
    const handler = (event: Event) => {
      const { usuarioId: updatedUid, frame } = (event as CustomEvent<FrameUpdatedDetail>).detail;
      setActiveProfile((prev) =>
        prev && prev.usuarioId === updatedUid ? { ...prev, frame } : prev
      );
    };
    window.addEventListener(FRAME_UPDATED_EVENT, handler);
    return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
  }, []);

  // Funções de Hover para o MiniProfile
  const handleMouseEnterAuthor = (userId: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(async () => {
      setShowMiniProfile(true);
      await loadMiniProfileData(userId);
    }, 200);
  };

  const handleMouseLeaveAuthor = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setShowMiniProfile(false);
    setActiveProfile(null);
  };

  // Redireciona o usuário ao clicar no botão
  const handleAuthorRedirect = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    
    // Fecha o modal do perfil atual se necessário
    setPerfilPerson(false);

    if (userId === usuarioIdAtual) {
      navigate(`/perfil/${usuarioIdAtual}`);
    } else {
      navigate(`/OutroPerfil/${userId}`);
    }
  };

  // Busca o personagem específico pelo ID
  useEffect(() => {
    if (!personagemId || !searchCharacterById) return;
    
    const loadCharacter = async () => {
      try {
        const encontrado = await searchCharacterById(personagemId);
        if (encontrado) {
          setPersonagem(encontrado);
        }
      } catch (err) {
        console.error('Erro ao carregar personagem:', err);
      }
    };

    loadCharacter();
  }, [personagemId, searchCharacterById]);

  // Busca a quantidade de likes
  useEffect(() => {
    if (!personagem?.id) return;

    const loadLikesCount = async () => {
      try {
        const total = await getQuantityLikes(personagem.id);
        setLikesCount(total);
      } catch (err) {
        console.error('Erro ao buscar likes:', err);
      }
    };

    loadLikesCount();
  }, [personagem?.id, getQuantityLikes]);

  const modalPerfil = () => setPerfilPerson(prev => !prev);

  // Gerencia o clique de curtir
  const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!personagem?.id) return;

    if (!usuarioId || !token) {
      navigate('/entrar');
      return;
    }

    if (isLoadingLike) return;

    setIsLoadingLike(true);
    try {
      await handleToggleLike(personagem.id);
      const updatedTotal = await getQuantityLikes(personagem.id);
      setLikesCount(updatedTotal);
    } catch (err) {
      console.error('Erro ao fazer like:', err);
    } finally {
      setIsLoadingLike(false);
    }
  };

  // Gerencia o clique de favoritar
  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!personagem?.id) return;

    if (!usuarioId || !token) {
      navigate('/entrar');
      return;
    }

    if (isLoadingFav) return;

    setIsLoadingFav(true);
    try {
      await handleToggleFavorite(personagem.id);
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
    } finally {
      setIsLoadingFav(false);
    }
  };
  
  useEffect(() => {
    const intervalo = setInterval(() => {
      setStatus(prev => prev === "Online" ? "Toque aqui, para ver mais detalhes" : "Online");
    }, 9000);
    return () => clearInterval(intervalo);
  }, []);

  if (!personagem) {
    return null;
  }

  return (
    <section className={`fixed top-0 ${styles.contantoPerson} ${!menuOpen ? styles.menuFechado : ''}`}>
      {/* Header do Perfil do Personagem */}
      <header 
        className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition px-4 py-2'
        onClick={modalPerfil}
      >
        <img
          src={personagem?.fotoia || '/image/semPerfil.jpg'}
          alt={personagem.nome}
          className='w-8 h-8 rounded-full object-cover'
        />
        <div className='flex-1 min-w-0'>
          <h2 className={`text-sm font-semibold ${styles.nomePersonagemHeader}`}>{personagem.nome}</h2>
          <p className='text-xs text-gray-400'>{status}</p>
        </div>
      </header>

      {/* Modal Perfil - Desktop */}
      {perfilPerson && personagem && (
        <div className={`${styles.modalOverlay} ${menuOpen ? styles.modalMenuAberto : styles.modalMenuFechado}`}
             onClick={() => setPerfilPerson(false)}>
          <div className={styles.modalPerfil} onClick={(e) => e.stopPropagation()}>
            <div className={styles.containerPerfil}>
              
              {/* Botão Fechar */}
              <button 
                className={styles.btnMenuProfile} 
                onClick={() => setPerfilPerson(false)}
                title="Fechar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Header da Carta */}
              <div className={styles.headerCarta}>
                <img 
                  src={personagem?.fotoia || '/image/semPerfil.jpg'} 
                  alt={personagem?.nome} 
                  className={styles.fotoPerfilGrande}
                />
                <h2 className={styles.nomePersonagem}>{personagem?.nome}</h2>

                {/* Interações */}
                <div className={styles.interacoes}>
                  {/* Like */}
                  <button onClick={handleLikeClick} title="Curtir">
                    <FiHeart
                      size={15}
                      style={{
                        cursor: 'pointer',
                        color: isLiked(personagem.id) ? '#ef4444' : 'currentColor',
                        fill: isLiked(personagem.id) ? '#ef4444' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                    <span>{likesCount}</span>
                  </button>

                  <span className={styles.divisoria}>|</span>

                  {/* Favorito */}
                  <button onClick={handleFavoriteClick} title={isFavorite(personagem.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}>
                    <FiStar
                      size={15}
                      style={{
                        cursor: 'pointer',
                        color: isFavorite(personagem.id) ? '#eab308' : 'currentColor', 
                        fill: isFavorite(personagem.id) ? '#eab308' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                    <span>{isFavorite(personagem.id) ? "Favorito" : "Favoritar"}</span>
                  </button>

                  <span className={styles.divisoria}>|</span>

                  {/* Visualizações */}
                  <div className="flex items-center gap-1 text-gray-400" title="Visualizações">
                    <FiMessageSquare size={15} />
                    <span>{personagem.visualizacoes ?? 0}</span>
                  </div>

                </div>
              </div>

              {/* Corpo da Carta */}
              <div className={styles.corpoCarta}>
                <div>
                  <span className={styles.labelSetor}>Bio</span>
                  <p className={styles.descricao}>{personagem.bio || "Este personagem ainda não possui uma biografia detalhada."}</p>
                </div>

                <div>
                  <span className={styles.labelSetor}>Descrição</span>
                  <p className={styles.descricao}>{personagem.descricao || "Este personagem ainda não possui uma descrição detalhada."}</p>
                </div>

                {/* Wrapper de autor com Hover que exibe o Popover e Clique que navega */}
                <div style={{ position: 'relative' }}>
                  <span className={styles.labelSetor}>Criado por</span>
                  <button
                    className={styles.btnCriador}
                    onMouseEnter={() => personagem.usuario_id && handleMouseEnterAuthor(personagem.usuario_id)}
                    onMouseLeave={handleMouseLeaveAuthor}
                    onClick={(e) => personagem.usuario_id && handleAuthorRedirect(e, personagem.usuario_id)}
                  >
                    <i className="fa-regular fa-user"></i>
                    @{nome?.nome || "Carregando..."}
                  </button>

                  {/* Renderização do Popover controlado pelo hover */}
                  {activeProfile && showMiniProfile && (
                    <div className={styles.popoverWrapper}>
                      <MiniProfile
                        usuarioId={activeProfile.usuarioId}
                        nome={activeProfile.nome}
                        foto={activeProfile.foto}
                        descricao={activeProfile.descricao}
                        frame={activeProfile.frame}
                        is_online={activeProfile.is_online}
                        onClose={() => {
                          setActiveProfile(null);
                          setShowMiniProfile(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfilePerson;