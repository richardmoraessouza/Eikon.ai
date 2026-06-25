"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { FiMoreVertical, FiCopy, FiTrash2, FiCornerUpLeft } from 'react-icons/fi';
import { BsPin } from 'react-icons/bs';
import type { ChatMessage as ChatMessageType } from '../../../types/chat/chat';
import { useAuth } from '../../../hooks/AuthContext/AuthContext';
import { normalizeFrame } from '../../../utils/frame';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  msg: ChatMessageType;
  characterName: string;
  characterPhoto?: string;
  characterFrame?: string | null;
  onReply: (msg: ChatMessageType) => void;
  onDelete: (msg: ChatMessageType) => void;
  onPin: (msg: ChatMessageType) => void;
}

export function ChatMessage({
  msg,
  characterName,
  characterPhoto,
  characterFrame,
  onReply,
  onDelete,
  onPin,
}: ChatMessageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { fotoPerfil, frame, usuario } = useAuth();

  const userFrameAtivo = normalizeFrame(frame);
  const userFramePath = userFrameAtivo ? `/image/frames/${userFrameAtivo}` : null;

  const charFrameAtivo = normalizeFrame(characterFrame ?? null);
  const charFramePath = charFrameAtivo ? `/image/frames/${charFrameAtivo}` : null;

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 180;

    let left = rect.left + rect.width / 2 - menuWidth / 2 - 60;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - 6;
    }

    setMenuPos({ top, left });
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [menuOpen]);

  const handleCopy   = () => { navigator.clipboard.writeText(msg.text); setMenuOpen(false); };
  const handleReply  = () => { onReply(msg);  setMenuOpen(false); };
  const handleDelete = () => { onDelete(msg); setMenuOpen(false); };
  const handlePin    = () => { onPin(msg);    setMenuOpen(false); };

  const isUser = msg.sender === 'user';

  const avatarSrc  = isUser ? (fotoPerfil || '/image/semPerfil.jpg') : (characterPhoto || '/image/semPerfil.jpg');
  const avatarAlt  = isUser ? (usuario ?? 'Você') : characterName;
  const framePath  = isUser ? userFramePath : charFramePath;
  const senderLabel = isUser ? (usuario ?? 'Você') : characterName;

  return (
    <article
      className={`${styles.message} ${isUser ? styles.userMessage : styles.botMessage}`}
      onDoubleClick={() => onReply(msg)}
    >
      <div className={`${styles.messageCol} ${isUser ? styles.messageColUser : styles.messageColBot}`}>

        {/* Avatar + nome */}
        <div className={`${styles.authorRow} ${isUser ? styles.authorRowUser : styles.authorRowBot}`}>
          <div className={styles.avatarWrapper}>
            <Image
              src={avatarSrc}
              alt={avatarAlt}
              fill
              sizes="40px"
              className={styles.avatar}
              unoptimized
            />
            {framePath && (
              <Image
                src={framePath}
                alt="Moldura"
                fill
                sizes="40px"
                className={styles.frame}
                unoptimized
              />
            )}
          </div>
          <span className={isUser ? styles.senderNameUser : styles.senderNameBot}>
            {senderLabel}
          </span>
        </div>

        {/* Bubble + botão menu */}
        <div className={`${styles.bubbleRow} ${isUser ? styles.bubbleRowUser : styles.bubbleRowBot}`}>
          <div className={`${styles.bubble} ${msg.isError ? styles.erroMensagem : ''}`}>
            {msg.pinned && (
              <div className={styles.pinnedBadge}>
                <BsPin size={10} /> fixada
              </div>
            )}

            {msg.quote && (
              <div className={styles.quoteBubble}>
                <span className={styles.quoteBubbleLabel}>
                  {msg.quote.sender === 'user' ? 'Você' : characterName}
                </span>
                <span className={styles.quoteBubbleText}>{msg.quote.text}</span>
              </div>
            )}

            <div style={{ margin: 0, wordBreak: 'break-word' }}>
              <ReactMarkdown
                components={{
                  em: ({ node, ...props }) => (
                    <em style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }} {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p style={{ margin: 0, display: 'inline' }} {...props} />
                  ),
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>

          {/* Botão menu — sem wrapper position:relative */}
          <button className={styles.menuBtn} onClick={handleMenuToggle} style={{ alignSelf: 'center' }}>
            <FiMoreVertical size={16} />
          </button>
        </div>

      </div>

      {/* Menu renderizado via portal no body, position fixed */}
      {menuOpen && menuPos && (
        <div
          ref={menuRef}
          className={styles.contextMenu}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
        >
          <button className={styles.contextMenuItem} onClick={handleReply}>
            <FiCornerUpLeft size={15} /> Responder
          </button>
          <button className={styles.contextMenuItem} onClick={handleCopy}>
            <FiCopy size={15} /> Copiar
          </button>
          <button className={styles.contextMenuItem} onClick={handlePin}>
            <BsPin size={15} /> {msg.pinned ? 'Desafixar' : 'Fixar'}
          </button>
          <button className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`} onClick={handleDelete}>
            <FiTrash2 size={15} /> Deletar
          </button>
        </div>
      )}
    </article>
  );
}