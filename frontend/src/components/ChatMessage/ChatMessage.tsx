import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiMoreVertical, FiCopy, FiTrash2, FiCornerUpLeft } from 'react-icons/fi';
import { BsPin } from 'react-icons/bs';
import type { ChatMessage as ChatMessageType } from '../../types/chat/chat';
import { useAuth } from '../../hooks/AuthContext/AuthContext';
import { normalizeFrame } from '../../utils/frame';
import appStyles from '../../App.module.css';
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

  const handleCopy = () => { navigator.clipboard.writeText(msg.text); setMenuOpen(false); };
  const handleReply = () => { onReply(msg); setMenuOpen(false); };
  const handleDelete = () => { onDelete(msg); setMenuOpen(false); };
  const handlePin = () => { onPin(msg); setMenuOpen(false); };

  const isUser = msg.sender === 'user';

  return (
    <article
      className={`${appStyles.message} ${isUser ? appStyles.userMessage : appStyles.botMessage}`}
      onDoubleClick={() => onReply(msg)}
    >
      <div className={styles.wrapper} style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}>

        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          <img
            src={isUser ? (fotoPerfil || '/image/semPerfil.jpg') : (characterPhoto || '/image/semPerfil.jpg')}
            alt={isUser ? (usuario ?? 'Você') : characterName}
            className={styles.avatar}
          />
          {(isUser ? userFramePath : charFramePath) && (
            <img
              src={(isUser ? userFramePath : charFramePath)!}
              alt="frame"
              className={styles.frame}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: isUser ? 'flex-end' : 'flex-start', flex: 1 }}>

          {/* Nome acima da bolha */}
          <span className={isUser ? styles.senderNameUser : styles.senderNameBot}>
            {isUser ? (usuario ?? 'Você') : characterName}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
            <div className={`${appStyles.bubble} ${msg.isError ? appStyles.erroMensagem : ''}`}>

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

            {/* Botão ••• */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button className={styles.menuBtn} onClick={() => setMenuOpen(v => !v)}>
                <FiMoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className={`${styles.contextMenu} ${isUser ? styles.contextMenuUser : styles.contextMenuBot}`}>
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
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}