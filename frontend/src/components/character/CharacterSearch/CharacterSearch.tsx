"use client"; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Image from 'next/image';
import { useAuth } from '../../../hooks/AuthContext/AuthContext';
import { useSocial } from '../../../hooks/useSocial/useSocial';
import { searchCreatorNameService } from '../../../services/users/userService';
import MiniProfile from '../../profiles/MiniProfile/MiniProfile';
import styles from './CharacterSearch.module.css';
import { FiMessageSquare, FiHeart } from "react-icons/fi";
import { CharacterSearchSkeleton } from './CharacterSearchSkeleton/CharacterSearchSkeleton';

interface CharacterSearchProps {
  personagem: any;
  creatorsMap: Record<number, string>;
  setCreatorsMap: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  isLoading?: boolean; 
}

export const CharacterSearch = ({ personagem, creatorsMap, setCreatorsMap, isLoading }: CharacterSearchProps) => {
  const router = useRouter(); 
  const { estaLogado } = useAuth();
  const { isLiked, isFavorite, handleToggleLike, handleToggleFavorite, getQuantityLikes } = useSocial();
  const [likesCount, setLikesCount] = useState<number>(0);
  const [showCreatorPreview, setShowCreatorPreview] = useState(false);

  const getCreatorUid = (): number | undefined => {
    const uid = personagem.usuario_id ?? 
                personagem.usuarioId ?? 
                personagem.user_id ?? 
                personagem.criador_id ?? 
                (personagem.usuario && (typeof personagem.usuario === 'number' ? personagem.usuario : (personagem.usuario.id || personagem.usuario._id)));
    return uid !== undefined && uid !== null ? Number(uid) : undefined;
  };

  useEffect(() => {
    let mounted = true;
    const loadLikes = async () => {
      const total = await getQuantityLikes(personagem.id);
      if (mounted) setLikesCount(total ?? 0);
    };
    
    loadLikes();
    return () => { mounted = false; };
  }, [personagem.id, getQuantityLikes]);

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

  // Se estiver carregando, intercepta o render e mostra o Skeleton
  if (isLoading) {
    return <CharacterSearchSkeleton />;
  }

  const getCreatorName = () => {
    const uid = getCreatorUid();
    return personagem.nome_criador || (uid !== undefined ? creatorsMap[uid] : undefined) || personagem.criador || 'Desconhecido';
  };

  const refreshLikeCount = async () => {
    const total = await getQuantityLikes(personagem.id);
    setLikesCount(total ?? 0);
  };

  return (
    // Trocado o navigate(...) por router.push(...)
    <div className={styles.polyCard} onClick={() => router.push(`/personagem/${personagem.id}`)}>
      
     
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

          {/* Linha de Tags */}
          {personagem.tags && personagem.tags.length > 0 && (
            <div className={styles.polyTagsContainer}>
              {personagem.tags.map((tag: string, index: number) => (
                <span key={index} className={styles.polyTagItem}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Nome do criador com hover do MiniProfile */}
          <div
            className={styles.authorWrapper}
            onMouseEnter={() => setShowCreatorPreview(true)}
            onMouseLeave={() => setShowCreatorPreview(false)}
          >
            <span className={styles.polyAuthor}>@{getCreatorName()}</span>

            {showCreatorPreview && getCreatorUid() !== undefined && (
              <div className={styles.miniProfilePopup} onClick={(e) => e.stopPropagation()}>
                <MiniProfile
                  usuarioId={getCreatorUid() as number}
                  nome={getCreatorName()}
                  foto={personagem.foto_criador}
                  descricao={personagem.descricao_criador}
                  frame={personagem.frame_criador}
                  is_online={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Ações na Extrema Direita */}
      <div className={styles.polyActionsContainer} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => handleToggleLike(personagem.id).then(() => refreshLikeCount())}
          className={`${styles.polyLikeButton} ${isLiked(personagem.id) ? styles.polyActiveLike : ''}`}
        >
          <FiHeart size={15} className={styles.statIcon} style={{ fill: isLiked(personagem.id) ? "#ff4b4b" : "none" }} />
          <span className={styles.statIcon}>{likesCount}</span>
        </button>

        <button
          className={styles.polyFavButton}
          onClick={() => {
            if (!estaLogado) { router.push('/entrar'); return; }
            handleToggleFavorite(personagem.id);
          }}
        >
          <i className={`fa ${isFavorite(personagem.id) ? 'fa-solid fa-star' : 'fa-regular fa-star'}`} style={{ color: isFavorite(personagem.id) ? '#FFD700' : '#666' }}></i>
        </button>

        <div className={styles.polyStats}>
          <FiMessageSquare size={14} className={styles.statIcon} />
          <span className={styles.statIcon}>{personagem.interacoes || '0'}</span>
        </div>
      </div>
    </div>
  );
};