"use client"; // Necessário por conta dos eventos de input (onChange, onKeyDown) e interações de botões

import React from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import type { ReplyQuote } from '../../../types/chat/chat';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  message: string;
  isLoading: boolean;
  characterName: string;
  replyTo: ReplyQuote | null;
  menuOpen: boolean;
  perfilAberto: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCancelReply: () => void;
}

export function ChatInput({
  message,
  characterName,
  isLoading,
  replyTo,
  menuOpen,
  perfilAberto,
  onChange,
  onSend,
  onKeyPress,
  onCancelReply
}: ChatInputProps) {
  return (
    <div
      className={`fixed ${styles.containerMensagem} ${!menuOpen ? styles.menuFechado : ''} ${perfilAberto ? styles.perfilAberto : ''}`}
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      {replyTo && (
        <div className={styles.quotePreviewInput}>
          <div className={styles.quotePreviewInputContent}>
            <span className={styles.quotePreviewInputLabel}>
              {replyTo.sender === 'user' ? 'Você' : characterName}
            </span>
            <span className={styles.quotePreviewInputText}>
              {replyTo.text}
            </span>
          </div>
          <button className={styles.quotePreviewInputClose} onClick={onCancelReply}>
            <FiX size={15} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          className={styles.mensagem}
          type="text"
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={replyTo ? 'Respondendo...' : `Fale com ${characterName}...`}
          disabled={isLoading}
        />
        <button 
          onClick={onSend} 
          disabled={isLoading || !message.trim()} 
          title="Enviar (Enter)" 
          className={styles.sendButton}
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
}