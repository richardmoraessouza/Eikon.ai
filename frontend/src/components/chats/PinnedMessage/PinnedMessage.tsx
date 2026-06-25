/**
 * Componente PinnedMessage - Exibe uma mensagem fixada no topo do chat
 * Mantido como Server Component para melhor performance e menor bundle de JS no cliente.
 */

import React from 'react';
import { BsPin } from 'react-icons/bs';
import { FiX } from 'react-icons/fi';
import type { ChatMessage as ChatMessageType } from '../../../types/chat/chat';
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
      
      <button className={styles.closeBtn} onClick={onUnpin} aria-label="Desfixar mensagem">
        <FiX size={15} />
      </button>
    </div>
  );
}