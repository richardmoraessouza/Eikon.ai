import { BsPin } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';
import type { ChatMessage as ChatMessageType } from '../../types/chat/chat';
import styles from './PinnedMessage.module.css';

interface PinnedMessageProps {
  msg: ChatMessageType;
  characterName: string;
  menuOpen: boolean;
  onUnpin: () => void;
}

export function PinnedMessage({ msg, characterName, onUnpin, menuOpen }: PinnedMessageProps) {
  return (
    <div className={`${styles.container} ${!menuOpen ? styles.menuFechado : ''}`}>
      <BsPin size={13} className={styles.icon} />
      <div className={styles.content}>
        <span className={styles.label}>
          {msg.sender === 'user' ? 'Você' : characterName}
        </span>
        <span className={styles.text}>{msg.text}</span>
      </div>
      <button className={styles.closeBtn} onClick={onUnpin}>
        <FiX size={15} />
      </button>
    </div>
  );
}