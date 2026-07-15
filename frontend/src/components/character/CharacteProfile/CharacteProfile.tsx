"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './CharacteProfile.module.css';
import { useAuth } from '../../../contexts/AuthContext/AuthContext';
import { useCharacters } from '../../../hooks/useCharacters/useCharacters';
import { useSocial } from '../../../hooks/useSocial/useSocial';
import { useUsers } from "../../../hooks/useUsers/useUsers";
import CharacterProfileTabs from './CharacterProfileTabs/CharacterProfileTabs';
import { FiMessageSquare, FiHeart, FiStar } from "react-icons/fi";
import { getMiniProfileService } from "../../../services/users/userService";
import { FRAME_UPDATED_EVENT, type FrameUpdatedDetail } from "../../../utils/frame";
import type { MiniProfileType } from "../../../types/users/users";
import type { ChatMessage as ChatMessageType } from '../../../types/chat/chat';

interface ProfilePersonProps {
  personagemId: string | number | null;
  menuOpen: boolean;
  usuarioIdAtual: number | null;
  perfilPerson: boolean;
  setPerfilPerson: React.Dispatch<React.SetStateAction<boolean>>;
  pinnedMessages: ChatMessageType[];
  isLoadingPinned: boolean;
  onUnpin: (msg: ChatMessageType) => void;
}

const CharacterProfile: React.FC<ProfilePersonProps> = ({ 
  personagemId,
  menuOpen,
  usuarioIdAtual, 
  perfilPerson,
  setPerfilPerson,
  pinnedMessages,
  isLoadingPinned,
  onUnpin,
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
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [favoriteOverride, setFavoriteOverride] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'Perfil' | 'histórico'>('Perfil');
  const router = useRouter();

  const { users } = useUsers(personagem?.usuario_id);
  const nome = users[0];

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

  const handleAuthorRedirect = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    setPerfilPerson(false);
    if (userId === usuarioIdAtual) {
      router.push(`/perfil/${usuarioIdAtual}`);
    } else {
      router.push(`/OutroPerfil/${userId}`);
    }
  };

  useEffect(() => {
    if (!personagemId || !searchCharacterById) return;
    const loadCharacter = async () => {
      try {
        const encontrado = await searchCharacterById(personagemId);
        if (encontrado) setPersonagem(encontrado);
      } catch (err) {
        console.error('Erro ao carregar personagem:', err);
      }
    };
    loadCharacter();
  }, [personagemId, searchCharacterById]);

  const characterKey = typeof personagem?.public_id === 'string' && personagem.public_id.trim()
    ? personagem.public_id
    : typeof personagem?.id === 'number' || typeof personagem?.id === 'string'
      ? String(personagem.id)
      : null;

  useEffect(() => {
    if (!characterKey) return;
    const loadLikesCount = async () => {
      try {
        const total = await getQuantityLikes(characterKey);
        setLikesCount(total);
      } catch (err) {
        console.error('Erro ao buscar likes:', err);
      }
    };
    loadLikesCount();
  }, [characterKey, getQuantityLikes]);

  useEffect(() => {
    if (!characterKey) return;
    setLikedOverride(null);
    setFavoriteOverride(null);
  }, [characterKey]);

  const isCharacterLiked = characterKey ? (likedOverride ?? isLiked(characterKey)) : false;
  const isCharacterFavorite = characterKey ? (favoriteOverride ?? isFavorite(characterKey)) : false;

  const modalPerfil = () => setPerfilPerson(prev => !prev);

  const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!characterKey) return;
    if (!usuarioId && !token) {
      router.replace('/login');
      return;
    }
    if (isLoadingLike) return;

    const wasLiked = isCharacterLiked;
    setLikedOverride(!wasLiked);
    setLikesCount(prev => Math.max(0, prev + (wasLiked ? -1 : 1)));
    setIsLoadingLike(true);

    try {
      await handleToggleLike(characterKey);
      const updatedTotal = await getQuantityLikes(characterKey);
      setLikesCount(updatedTotal ?? 0);
      setLikedOverride(null);
    } catch (err) {
      console.error('Erro ao fazer like:', err);
      setLikedOverride(wasLiked);
      setLikesCount(prev => Math.max(0, prev + (wasLiked ? 1 : -1)));
    } finally {
      setIsLoadingLike(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!characterKey) return;
    if (!usuarioId && !token) {
      router.replace('/login');
      return;
    }
    if (isLoadingFav) return;

    const wasFavorite = isCharacterFavorite;
    setFavoriteOverride(!wasFavorite);
    setIsLoadingFav(true);

    try {
      await handleToggleFavorite(characterKey);
      setFavoriteOverride(null);
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
      setFavoriteOverride(wasFavorite);
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

  if (!personagem) return null;

  return (
    <section className={`fixed top-0 ${styles.contantoPerson} ${!menuOpen ? styles.menuFechado : styles.menuAberto}`}>

      <header 
        className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition py-1'
        onClick={modalPerfil}
      >
        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
          <Image
            src={personagem?.fotoia || '/image/semPerfil.jpg'}
            alt={personagem.nome}
            fill
            sizes="32px"
            className='rounded-full object-cover'
            unoptimized
          />
        </div>
        <div className='flex-1 min-w-0'>
          <h2 className={`text-sm font-semibold ${styles.nomePersonagemHeader}`}>{personagem.nome}</h2>
          <p className='text-xs text-gray-400'>{status}</p>
        </div>
      </header>

      {perfilPerson && personagem && (
        <div
          className={`${styles.modalOverlay} ${menuOpen ? styles.modalMenuAberto : styles.modalMenuFechado}`}
          onClick={() => setPerfilPerson(false)}
        >
          <div className={styles.modalPerfil} onClick={(e) => e.stopPropagation()}>
            <div className={styles.containerPerfil}>

              <button 
                className={styles.btnMenuProfile} 
                onClick={() => setPerfilPerson(false)}
                title="Fechar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div className={styles.headerCarta}>
                <div className={styles.fotoPerfilGrandeWrapper} style={{ position: 'relative' }}>
                  <Image 
                    src={personagem?.fotoia || '/image/semPerfil.jpg'} 
                    alt={personagem?.nome} 
                    fill
                    sizes="(max-width: 768px) 100vw, 150px"
                    className={styles.fotoPerfilGrande}
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                </div>
                <h2 className={styles.nomePersonagem}>{personagem?.nome}</h2>

                <div className={styles.interacoes}>
                  <button
                    onClick={handleLikeClick}
                    title="Curtir"
                    disabled={isLoadingLike}
                    aria-pressed={isCharacterLiked}
                    style={{ opacity: isLoadingLike ? 0.7 : 1 }}
                  >
                    <FiHeart
                      size={15}
                      style={{
                        cursor: 'pointer',
                        color: isCharacterLiked ? '#ef4444' : 'currentColor',
                        fill: isCharacterLiked ? '#ef4444' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                    <span>{likesCount}</span>
                  </button>

                  <span className={styles.divisoria}>|</span>

                  <button
                    onClick={handleFavoriteClick}
                    title={isCharacterFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    disabled={isLoadingFav}
                    aria-pressed={isCharacterFavorite}
                    style={{ opacity: isLoadingFav ? 0.7 : 1 }}
                  >
                    <FiStar
                      size={15}
                      style={{
                        cursor: 'pointer',
                        color: isCharacterFavorite ? '#eab308' : 'currentColor',
                        fill: isCharacterFavorite ? '#eab308' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                    <span>{isCharacterFavorite ? "Favorito" : "Favoritar"}</span>
                  </button>

                  <span className={styles.divisoria}>|</span>

                  <div className="flex items-center gap-1 text-gray-400" title="Visualizações">
                    <FiMessageSquare size={15} />
                    <span>{personagem.visualizacoes ?? 0}</span>
                  </div>
                </div>
              </div>

              <CharacterProfileTabs
                personagem={personagem}
                nome={nome}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeProfile={activeProfile}
                showMiniProfile={showMiniProfile}
                handleMouseEnterAuthor={handleMouseEnterAuthor}
                handleMouseLeaveAuthor={handleMouseLeaveAuthor}
                handleAuthorRedirect={handleAuthorRedirect}
                setActiveProfile={setActiveProfile}
                setShowMiniProfile={setShowMiniProfile}
                pinnedMessages={pinnedMessages}
                isLoadingPinned={isLoadingPinned}
                onUnpin={onUnpin}
              />

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CharacterProfile;