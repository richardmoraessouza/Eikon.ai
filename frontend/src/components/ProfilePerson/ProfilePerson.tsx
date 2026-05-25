import React, { useState, useEffect } from 'react';
import styles from './ProfilePerson.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useMeusPersonagens } from '../../hooks/UserPerson/UserPerson';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { useFavorites } from '../../hooks/FavoritesContext/FavoritesContext';

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
  const { token } = useAuth();
  const { adicionarFavorito, removerFavorito } = useFavorites();
  const [nome, setNome] = useState<CriadorNome | null>(null);
  const [status, setStatus] = useState<string>("Online");
  const navigate = useNavigate();

  const { personagens, like, favorito } = useMeusPersonagens(usuarioIdAtual || 0, token || '');

  
  // Encontra o personagem atual dentro da lista para refletir os estados de like/favorito
  const personagem = personagens.find(p => p.id === personagemId) || null;


  useEffect(() => {
      // A condição do tamanho da tela fica DENTRO do hook
      if (personagem && window.innerWidth > 1500) {
        setPerfilPerson(true);
      }
    }, [personagem]);

  const modalPerfil = () => setPerfilPerson(prev => !prev);

  const handleFavorito = (p: Personagem) => {
    if (p.favoritadoPeloUsuario) {
      removerFavorito(p.id);
    } else {
      adicionarFavorito({
        id: p.id,
        nome: p.nome,
        fotoia: p.fotoia || '/image/semPerfil.jpg'
      });
    }
    localStorage.setItem('favoritos_updated', Date.now().toString());
    favorito(p.id);
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

  if (!personagem) return null;

  return (
    <section className={`fixed top-0 ${styles.contantoPerson} ${!menuOpen ? styles.menuFechado : ''}`}>
      <header className='mx-auto text-center flex flex-row items-center gap-2 cursor-pointer' onClick={modalPerfil}>
        <img
          src={personagem.fotoia || '/image/semPerfil.jpg'}
          alt={personagem.nome}
          className='w-10 h-10 rounded-full object-cover shadow-2xl'
        />
        <div>
          <h2 className='w-full flex items-start'>{personagem.nome}</h2>
          <div className={styles.status}>
            <p className='text-xs text-gray-200'>{status}</p>
          </div>
        </div>
      </header>

      {perfilPerson && (
        <div className={styles.modalOverlay} onClick={() => setPerfilPerson(false)}>
          <div className={styles.modalPerfil} onClick={(e) => e.stopPropagation()}>
            <div className={styles.containerPerfil}>
              <div className={styles.headerCarta}>
                <button className={styles.btnMenuProfile} onClick={() => setPerfilPerson(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <img src={personagem.fotoia || '/image/semPerfil.jpg'} alt={personagem.nome} className={styles.fotoPerfilGrande} />
                <h2 className={styles.nomePersonagem}>{personagem.nome}</h2>
                <span className="text-sm text-gray-400">Personagem Virtual</span>

                <article className={`flex row-auto items-center justify-center gap-4 mt-4 ${styles.interacoes}`}>
                  {/* Botão Like */}
                  <button onClick={() => like(personagem.id)} className="flex items-center gap-2 cursor-pointer">
                    <span>{personagem.likes ?? 0}</span>

                    <svg width="20" height="20" viewBox="0 0 24 24" fill={personagem.curtidoPeloUsuario ? "#ff4b4b" : "none"} stroke={personagem.curtidoPeloUsuario ? "#ff4b4b" : "currentColor"} strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>

                  <span className={styles.divisoria}>|</span>

                  {/* Botão Favorito */}
                  <button onClick={() => handleFavorito(personagem)} className="cursor-pointer">
                    <i className={`fa ${personagem.favoritadoPeloUsuario ? "fa-solid fa-star" : "fa-regular fa-star"}`} 
                       style={{ color: personagem.favoritadoPeloUsuario ? "#FFD700" : "#fff" }}></i>
                  </button>
                  
                  <span className={styles.divisoria}>|</span>

                  <button className="flex items-center gap-2">
                   <span>0</span>
                   <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                </article>
              </div>

              <div className={styles.corpoCarta}>
                <span className={styles.labelSetor}>Bio</span>
                <p className={styles.descricao}>{personagem.bio || "Este personagem ainda não possui uma biografia detalhada."}</p>

                <span className={styles.labelSetor}>Descrição</span>
                <p className={styles.descricao}>{personagem.descricao || "Este personagem ainda não possui uma descrição detalhada."}</p>

                <span className={styles.labelSetor}>Criado por</span>
                <button
                  className={styles.btnCriador}
                  onClick={() => {
                    personagem.usuario_id === usuarioIdAtual 
                      ? navigate(`/perfil/${usuarioIdAtual}`) 
                      : navigate(`/OutroPerfil/${personagem.usuario_id}`);
                  }}>
                  <i className="fa-regular fa-user"></i>
                  {nome?.nome || "Carregando..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfilePerson;