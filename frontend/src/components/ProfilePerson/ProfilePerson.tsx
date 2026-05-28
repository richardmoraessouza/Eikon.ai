import React, { useState, useEffect } from 'react';
import styles from './ProfilePerson.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { toggleFavorito, buscarDadosPersonagem, toggleLike, buscarQuantidadeLikes } from '../../services/personagemService';

interface Personagem {
  id: number;
  nome: string;
  fotoia?: string;
  descricao?: string;
  usuario_id: number;
  bio?: string;
  criador?: string;
  likes?: number;
  curtidoPeloUsuario?: boolean;
  favoritadoPeloUsuario?: boolean;
}

interface CriadorNome {
  nome: string;
}

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
  const [personagem, setPersonagem] = useState<Personagem | null>(null);
  const [nome, setNome] = useState<CriadorNome | null>(null);
  const [status, setStatus] = useState<string>("Online");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  console.log('[ProfilePerson] personagemId:', personagemId, 'usuarioIdAtual:', usuarioIdAtual);

  // Carregar dados do personagem específico
  useEffect(() => {
    if (!personagemId) return;

    const carregar = async () => {
      setLoading(true);
      try {
        const dados = await buscarDadosPersonagem(personagemId);
        console.log('[ProfilePerson] Personagem carregado:', dados.nome);
        setPersonagem(dados);
      } catch (err) {
        console.error('[ProfilePerson] Erro ao carregar personagem:', err);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [personagemId]);


  useEffect(() => {
      // A condição do tamanho da tela fica DENTRO do hook
      if (personagem && window.innerWidth > 1500) {
        setPerfilPerson(true);
      }
    }, [personagem]);

  const modalPerfil = () => setPerfilPerson(prev => !prev);

  const handleFavorito = async () => {
    if (!usuarioId || !token || token.trim() === '') {
      navigate('/entrar');
      return;
    }
    
    if (!personagem) return;
    
    try {
      await toggleFavorito(usuarioId, personagem.id, token);
      setPersonagem(prev => prev ? {
        ...prev,
        favoritadoPeloUsuario: !prev.favoritadoPeloUsuario
      } : null);
    } catch (err: any) {
      console.error("Erro ao alternar favorito:", err);
      if (err?.response?.status === 401) {
        navigate('/entrar');
      }
    }
  };

  const handleLike = async () => {
    if (!usuarioId || !token || token.trim() === '') {
      navigate('/entrar');
      return;
    }

    if (!personagem) return;

    try {
      await toggleLike(usuarioId, personagem.id, token);
      const novaQuantidade = await buscarQuantidadeLikes(personagem.id);
      setPersonagem(prev => prev ? {
        ...prev,
        curtidoPeloUsuario: !prev.curtidoPeloUsuario,
        likes: novaQuantidade
      } : null);
    } catch (err: any) {
      console.error("Erro ao dar like:", err);
      if (err?.response?.status === 401) {
        navigate('/entrar');
      }
    }
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setStatus(prev => prev === "Online" ? "Toque aqui, para ver mais detalhes" : "Online");
    }, 9000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const nomeCriado = async () => {
      if (personagem) {
        try {
          const res = await axios.get(`${API_URL}/users/name-other-user/${personagem.usuario_id}`);
          setNome(res.data);
        } catch (err) {
          console.error('Erro ao carregar o nome do criador', err);
        }
      }
    };
    nomeCriado();
  }, [personagem]);

  if (!personagemId) {
    console.warn('[ProfilePerson] Nenhum personagemId fornecido');
    return null;
  }

  if (loading) {
    return null;
  }

  if (!personagem) {
    console.warn('[ProfilePerson] Personagem não encontrado');
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
          src={personagem.fotoia || '/image/semPerfil.jpg'}
          alt={personagem.nome}
          className='w-10 h-10 rounded-full object-cover'
        />
        <div className='flex-1 min-w-0'>
          <h2 className='text-sm font-semibold text-white'>{personagem.nome}</h2>
          <p className='text-xs text-gray-400'>{status}</p>
        </div>
      </header>

      {/* Modal Perfil - Desktop */}
      {perfilPerson && (
        <div className={styles.modalOverlay} onClick={() => setPerfilPerson(false)}>
          <div className={styles.modalPerfil} onClick={(e) => e.stopPropagation()}>
            <div className={styles.containerPerfil}>
              
              {/* Botão Fechar (Apenas Desktop Grande) */}
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
                  src={personagem.fotoia || '/image/semPerfil.jpg'} 
                  alt={personagem.nome} 
                  className={styles.fotoPerfilGrande}
                />
                <h2 className={styles.nomePersonagem}>{personagem.nome}</h2>
                <span className='text-xs text-gray-400'>Personagem Virtual</span>

                {/* Interações */}
                <div className={styles.interacoes}>
                  {/* Like */}
                  <button onClick={handleLike} title="Curtir">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={personagem.curtidoPeloUsuario ? "#ef4444" : "none"} stroke={personagem.curtidoPeloUsuario ? "#ef4444" : "currentColor"} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>{personagem.likes ?? 0}</span>
                  </button>

                  <span className={styles.divisoria}>|</span>

                  {/* Favorito */}
                  <button onClick={handleFavorito} title={personagem.favoritadoPeloUsuario ? "Remover de favoritos" : "Adicionar aos favoritos"}>
                    <i 
                      className={`fa ${personagem.favoritadoPeloUsuario ? "fa-solid fa-star" : "fa-regular fa-star"}`}
                      style={{ color: personagem.favoritadoPeloUsuario ? "#fbbf24" : "currentColor" }}
                    ></i>
                  </button>
                  
                  <span className={styles.divisoria}>|</span>

                  {/* Comentários */}
                  <button title="Comentários em breve">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5v-5a3 3 0 0 1-3-3V5z"/>
                    </svg>
                    <span>0</span>
                  </button>
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

                <div>
                  <span className={styles.labelSetor}>Criado por</span>
                  <button
                    className={styles.btnCriador}
                    onClick={() => {
                      personagem.usuario_id === usuarioIdAtual 
                        ? navigate(`/perfil/${usuarioIdAtual}`) 
                        : navigate(`/OutroPerfil/${personagem.usuario_id}`);
                    }}
                  >
                    <i className="fa-regular fa-user"></i>
                    {nome?.nome || "Carregando..."}
                  </button>
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