import React, { useState, useEffect } from 'react';
import styles from './ProfilePerson.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/api';

interface Personagem {
  id: number;
  nome: string;
  fotoia?: string;
  usuario_id: number;
  bio?: string;
  criador?: string;
}

interface CriadorNome {
  nome: string;
}

interface ProfilePersonProps {
  personagemId: number | null;
  menuOpen: boolean;
  usuarioIdAtual: number | null;
  perfilPerson: boolean;
  criador?: string;
  setPerfilPerson: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfilePerson: React.FC<ProfilePersonProps> = ({ personagemId, menuOpen, usuarioIdAtual, perfilPerson, setPerfilPerson }) => {
  const [personagem, setPersonagem] = useState<Personagem | null>(null);
  const [nome, setNome] = useState<CriadorNome | null>(null);
  const navigate = useNavigate();
  const modalPerfil = () => setPerfilPerson(prev => !prev);

  // Busca dados do personagem
  useEffect(() => {
    if (!personagemId) {
      setPersonagem(null);
      return;
    }

    let cancelado = false;

    const buscarPersonagemId = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/character/data-character/${personagemId}`
        );

        if (!cancelado) {
            setPersonagem(res.data.personagem);
        }

      } catch (err) {
        if (!cancelado) console.error('Erro ao carregar os dados do personagem', err);
      }
    };

    buscarPersonagemId();
    return () => { cancelado = true; };
  }, [personagemId]);

   // Busca nome do criador
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
      <div className='mx-auto text-center flex flex-row items-center gap-2 cursor-pointer' onClick={modalPerfil}>
        <img
          src={personagem.fotoia || '/image/semPerfil.jpg'}
          alt={personagem.nome}
          className='w-10 h-10 rounded-full object-cover shadow-2xl'
        />
        <div className='flex flex-col gap-0 items-center justify-center'>
          <h2>{personagem.nome}</h2>
          <div className='w-full flex items-start'>
            <p className={styles.online}>Online</p>
          </div>
        </div>
      </div>

      {perfilPerson && (
        <div className={styles.modalOverlay} onClick={() => setPerfilPerson(false)}>
          <div className={styles.modalPerfil} onClick={(e) => e.stopPropagation()}>
            <div className={styles.containerPerfil}>
              <div className={styles.headerCarta}>
                <img
                  src={personagem.fotoia || '/image/semPerfil.jpg'}
                  alt={personagem.nome}
                  className={styles.fotoPerfilGrande}
                />
                <h2 className={styles.nomePersonagem}>{personagem.nome}</h2>
                <span className="text-sm text-gray-400">Personalidade Virtual</span>
              </div>

              <div className={styles.corpoCarta}>
                <span className={styles.labelSetor}>Sobre</span>
                <p className={styles.descricao}>
                  {personagem.bio || "Este personagem ainda não possui uma biografia detalhada."}
                </p>

                <span className={styles.labelSetor}>Criado por</span>
                <button
                  className={styles.btnCriador}
                  onClick={() => {
                    if (personagem.usuario_id === usuarioIdAtual) {
                      navigate(`/perfil/${usuarioIdAtual}`);
                    } else {
                      navigate(`/OutroPerfil/${personagem.usuario_id}`);
                    }
                  }}
                >
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