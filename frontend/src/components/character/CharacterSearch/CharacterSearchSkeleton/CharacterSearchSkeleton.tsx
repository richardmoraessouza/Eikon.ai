import styles from './CharacterSearch.module.css';

export const CharacterSearchSkeleton = () => {
  return (
    <div className={`${styles.polyCard} ${styles.skeletonCard}`}>
      {/* 1. Imagem à Esquerda */}
      <div className={styles.polyImageContainer}>
        <div className={`${styles.polyImage} ${styles.skeletonPulse}`} style={{ height: '100%' }} />
      </div>
      
      {/* 2. Conteúdo Centralizado */}
      <div className={styles.polyContent}>
        <div className={styles.polyHeaderCol}>
          {/* Alinha com a tag h3 */}
          <div className={`${styles.polyName} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ height: '18px' }} />

          {/* Alinha com a tag p da Bio */}
          <div className={styles.polyBio} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className={`${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '90%', height: '14px' }} />
            <div className={`${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '60%', height: '14px' }} />
          </div>

          {/* Linha de Tags */}
          <div className={styles.polyTagsContainer}>
            <div className={`${styles.polyTagItem} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '45px', height: '22px', backgroundColor: 'transparent' }} />
            <div className={`${styles.polyTagItem} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '55px', height: '22px', backgroundColor: 'transparent' }} />
            <div className={`${styles.polyTagItem} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '40px', height: '22px', backgroundColor: 'transparent' }} />
          </div>

          {/* Autor */}
          <div className={`${styles.polyAuthor} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '75px', height: '14px' }} />
        </div>
      </div>

      {/* 3. Ações na Extrema Direita */}
      <div className={styles.polyActionsContainer}>
        <div className={`${styles.polyLikeButton} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '32px', height: '20px' }} />
        <div className={`${styles.polyFavButton} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '20px', height: '20px' }} />
        <div className={`${styles.polyStats} ${styles.skeletonPulse} ${styles.skeletonBlock}`} style={{ width: '28px', height: '16px' }} />
      </div>
    </div>
  );
};