import styles from './ChatMessageSkeleton.module.css';

interface ChatMessageSkeletonProps {
  isUser?: boolean;
  bubbleWidth?: number; // 0–100, % da largura máxima da bolha
}

export function ChatMessageSkeleton({ isUser = false, bubbleWidth = 70 }: ChatMessageSkeletonProps) {
  return (
    <div
      className={styles.skeletonWrapper}
      style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}
    >
      <div className={`${styles.skeletonAvatar} ${styles.shimmer}`} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          flex: 1,
        }}
      >
        <div className={`${styles.skeletonName} ${styles.shimmer}`} />
        <div
          className={`${styles.skeletonBubble} ${styles.shimmer}`}
          style={{ width: `${bubbleWidth}%` }}
        />
      </div>
    </div>
  );
}