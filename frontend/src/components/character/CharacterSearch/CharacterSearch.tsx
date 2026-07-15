"use client"; 

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext/AuthContext';
import { useSocial } from '../../../hooks/useSocial/useSocial';
import { searchCreatorNameService, getMiniProfileService } from '../../../services/users/userService';
import MiniProfile from '../../profiles/MiniProfile/MiniProfile';
import type { MiniProfileType } from '../../../types/users/users';
import styles from './CharacterSearch.module.css';
import { FiMessageSquare, FiHeart } from "react-icons/fi";
import { CharacterSearchSkeleton } from './CharacterSearchSkeleton/CharacterSearchSkeleton';

interface CharacterSearchProps {
  personagem: any;
  creatorsMap: Record<number, string>;
  setCreatorsMap: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  isLoading?: boolean; 
}

interface PopoverPosition {
  top: number;
  left: number;
}

const POPOVER_WIDTH = 252;
const POPOVER_MARGIN = 16;
const POPOVER_GAP = 8;

export const CharacterSearch = ({ personagem, creatorsMap, setCreatorsMap, isLoading }: CharacterSearchProps) => {
  const router = useRouter(); 
  const { estaLogado } = useAuth();
  const { isLiked, isFavorite, handleToggleLike, handleToggleFavorite, getQuantityLikes } = useSocial();
  const [likesCount, setLikesCount] = useState<number>(0);

  // Estado do popover (agora via portal, igual ao CarouselRow)
  const [activeProfile, setActiveProfile] = useState<MiniProfileType | null>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverRequestRef = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const getCreatorUid = (): number | undefined => {
    const uid = personagem.usuario_id ?? 
                personagem.usuarioId ?? 
                personagem.user_id ?? 
                personagem.criador_id ?? 
                (personagem.usuario && (typeof personagem.usuario === 'number' ? personagem.usuario : (personagem.usuario.id || personagem.usuario._id)));
    return uid !== undefined && uid !== null ? Number(uid) : undefined;
  };

  const getCharacterIdentifier = (): string | undefined => {
    const publicId = personagem.public_id ?? personagem.publicId ?? personagem.characterPublicId;
    if (typeof publicId === 'string' && publicId.trim()) return publicId;
    const id = personagem.id ?? personagem.characterId ?? personagem.personagem_id;
    return Number.isInteger(Number(id)) && Number(id) > 0 ? String(id) : undefined;
  };

  useEffect(() => {
    let mounted = true;
    const loadLikes = async () => {
      const characterId = getCharacterIdentifier();
      if (!characterId) {
        setLikesCount(0);
        return;
      }

      const total = await getQuantityLikes(characterId);
      if (mounted) setLikesCount(total ?? 0);
    };
    
    loadLikes();
    return () => { mounted = false; };
  }, [personagem, getQuantityLikes]);

  useEffect(() => {
    let mounted = true;
    const loadCreator = async () => {
      const uid = getCreatorUid();

      if (!uid || creatorsMap[uid]) return;

      try {
        const creatorData = await searchCreatorNameService(uid).catch(() => ({ nome: 'Desconhecido' }));
        if (!mounted) return;
        
        setCreatorsMap(prev => ({
          ...prev,
          [uid]: creatorData?.nome || 'Desconhecido'
        }));
      } catch (err) {
        console.error('Erro ao buscar nome do criador', err);
      }
    };

    loadCreator();
    return () => { mounted = false; };
  }, [personagem, creatorsMap, setCreatorsMap]);

  const computePosition = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(
      POPOVER_MARGIN,
      Math.min(left, window.innerWidth - POPOVER_WIDTH - POPOVER_MARGIN)
    );
    const top = Math.max(POPOVER_MARGIN, rect.top - POPOVER_GAP);
    setPopoverPos({ top, left });
  };

  const closePopover = () => {
    hoverRequestRef.current += 1;
    setActiveProfile(null);
    setPopoverPos(null);
  };

  const handleMouseEnterAuthor = (e: React.MouseEvent<HTMLDivElement>) => {
    const uid = getCreatorUid();
    if (uid === undefined) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const anchor = e.currentTarget;
    const requestId = ++hoverRequestRef.current;

    hoverTimerRef.current = setTimeout(async () => {
      computePosition(anchor);
      try {
        const data = await getMiniProfileService(uid);
        if (hoverRequestRef.current === requestId) {
          setActiveProfile(data);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do mini perfil:', err);
      }
    }, 200);
  };

  const handleMouseLeaveAuthor = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(closePopover, 120);
  };

  useEffect(() => {
    if (!activeProfile) return;
    const handleWindowChange = () => closePopover();
    window.addEventListener('scroll', handleWindowChange, true);
    window.addEventListener('resize', handleWindowChange);
    return () => {
      window.removeEventListener('scroll', handleWindowChange, true);
      window.removeEventListener('resize', handleWindowChange);
    };
  }, [activeProfile]);

  if (isLoading) {
    return <CharacterSearchSkeleton />;
  }

  const getCreatorName = () => {
    const uid = getCreatorUid();
    if (uid !== undefined && creatorsMap[uid]) {
      return creatorsMap[uid];
    }
    return personagem.criador || 'Desconhecido';
  };

  const characterId = getCharacterIdentifier();

  const handleLikeClick = async () => {
    if (!characterId) return;

    const liked = isLiked(characterId);

    // Atualiza imediatamente
    setLikesCount(prev =>
      Math.max(0, prev + (liked ? -1 : 1))
    );

    try {
      await handleToggleLike(characterId);
    } catch {
      // Reverte caso dê erro
      setLikesCount(prev =>
        Math.max(0, prev + (liked ? 1 : -1))
      );
    }
  };

  return (
    <div className={styles.polyCard} onClick={() => router.push(`/personagem/${personagem.public_id}`)}>
      
      <div className={styles.polyImageContainer} style={{ position: 'relative' }}>
        <Image 
          src={personagem.fotoia || "/image/semPerfil.jpg"} 
          alt={personagem.nome} 
          fill
          sizes="(max-width: 768px) 100vw, 120px"
          className={styles.polyImage}
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      </div>
      <div className={styles.polyContent}>
        <div className={styles.polyHeaderCol}>
          <h3 className={styles.polyName}>{personagem.nome}</h3>

          <p className={styles.polyBio}>
            {personagem.bio || 'Sem descrição bio'}
          </p>

          {personagem.tags && personagem.tags.length > 0 && (
            <div className={styles.polyTagsContainer}>
              {personagem.tags.map((tag: string, index: number) => (
                <span key={index} className={styles.polyTagItem}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className={styles.authorWrapper}
            onMouseEnter={handleMouseEnterAuthor}
            onMouseLeave={handleMouseLeaveAuthor}
          >
            <span className={styles.polyAuthor}>@{getCreatorName()}</span>
          </div>
        </div>
      </div>

      <div className={styles.polyActionsContainer} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleLikeClick}
          className={`${styles.polyLikeButton} ${
            characterId && isLiked(characterId)
              ? styles.polyActiveLike
              : ""
          }`}
        >
          <FiHeart
            size={15}
            className={styles.statIcon}
            style={{
              fill: characterId && isLiked(characterId)
                ? "#ff4b4b"
                : "none",
            }}
          />
          <span className={styles.statIcon}>{likesCount}</span>
        </button>

        <button
          className={styles.polyFavButton}
          onClick={() => {
            if (!estaLogado) { router.replace('/login'); return; }
            if (!characterId) return;
            handleToggleFavorite(characterId);
          }}
        >
          <i className={`fa ${characterId && isFavorite(characterId) ? 'fa-solid fa-star' : 'fa-regular fa-star'}`} style={{ color: characterId && isFavorite(characterId) ? '#FFD700' : '#666' }}></i>
        </button>

        <div className={styles.polyStats}>
          <FiMessageSquare size={14} className={styles.statIcon} />
          <span className={styles.statIcon}>{personagem.interacoes || '0'}</span>
        </div>
      </div>

      {mounted && activeProfile && popoverPos &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: popoverPos.top,
              left: popoverPos.left,
              transform: `translateY(calc(-100% - ${POPOVER_GAP}px))`,
              width: POPOVER_WIDTH,
              maxWidth: `calc(100vw - ${POPOVER_MARGIN * 2}px)`,
              zIndex: 2147483647,
            }}
            onMouseEnter={() => hoverTimerRef.current && clearTimeout(hoverTimerRef.current)}
            onMouseLeave={closePopover}
          >
            <MiniProfile
              usuarioId={activeProfile.usuarioId}
              nome={activeProfile.nome}
              foto={activeProfile.foto}
              descricao={activeProfile.descricao}
              frame={activeProfile.frame}
              nivel={activeProfile.nivel}
              is_online={activeProfile.is_online}
            />
          </div>,
          document.body
        )
      }
    </div>
  );
};