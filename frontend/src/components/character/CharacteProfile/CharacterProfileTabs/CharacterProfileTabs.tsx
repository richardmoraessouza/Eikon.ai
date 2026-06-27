"use client";

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MiniProfile from "../../../profiles/MiniProfile/MiniProfile";
import type { MiniProfileType } from "../../../../types/users/users";
import type { ChatMessage as ChatMessageType } from "../../../../types/chat/chat";
import styles from "./CharacterProfileTabs.module.css";
import * as chatApiService from '../../../../services/chat/chatService';
import { BsPin } from 'react-icons/bs';

interface CharacterProfileTabsProps {
  personagem: any;
  nome: any;
  activeTab: 'Perfil' | 'histórico';
  setActiveTab: (tab: 'Perfil' | 'histórico') => void;
  activeProfile: MiniProfileType | null;
  showMiniProfile: boolean;
  handleMouseEnterAuthor: (userId: number) => void;
  handleMouseLeaveAuthor: () => void;
  handleAuthorRedirect: (e: React.MouseEvent, userId: number) => void;
  setActiveProfile: (profile: MiniProfileType | null) => void;
  setShowMiniProfile: (show: boolean) => void;
  pinnedMessages: ChatMessageType[];
  onUnpin: (msg: ChatMessageType) => void;
}

const CharacterProfileTabs: React.FC<CharacterProfileTabsProps> = ({
  personagem,
  nome,
  activeTab,
  setActiveTab,
  activeProfile,
  showMiniProfile,
  handleMouseEnterAuthor,
  handleMouseLeaveAuthor,
  handleAuthorRedirect,
  setActiveProfile,
  setShowMiniProfile,
  pinnedMessages,
  onUnpin,
}) => {

  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  useEffect(() => {
    if (!personagem?.id) return;
    chatApiService.fetchConversationTime(personagem.id)
      .then((data) => setTotalSeconds(data.total_seconds))
      .catch(console.error);
  }, [personagem?.id]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return min > 0 ? `${h}h ${min}min` : `${h}h`;
  };

  return (
    <div className={styles.corpoCarta}>

      <section className={styles.tabsContainer}>
        <button className={styles.btnSetor} onClick={() => setActiveTab('Perfil')}>
          <span className={`${styles.labelSetor} ${activeTab === 'Perfil' ? styles.labelSetorAtivo : ''}`}>
            Perfil
          </span>
        </button>
        <button className={styles.btnSetor} onClick={() => setActiveTab('histórico')}>
          <span className={`${styles.labelSetor} ${activeTab === 'histórico' ? styles.labelSetorAtivo : ''}`}>
            Histórico
          </span>
        </button>
      </section>

      {activeTab === 'Perfil' && (
        <article className={styles.conteudoSobre}>

          <div className={styles.campo}>
            <span className={styles.labelCampo}>Bio</span>
            <p className={styles.descricao}>
              {personagem.bio || "Este personagem ainda não possui uma biografia detalhada."}
            </p>
          </div>

          <div className={styles.campo}>
            <span className={styles.labelCampo}>Descrição</span>
            <p className={styles.descricao}>
              {personagem.descricao || "Este personagem ainda não possui uma descrição detalhada."}
            </p>
          </div>

          <div className={styles.campo} style={{ position: 'relative' }}>
            <span className={styles.labelCampo}>Criado por</span>
            <button
              className={styles.btnCriador}
              onMouseEnter={() => personagem.usuario_id && handleMouseEnterAuthor(personagem.usuario_id)}
              onMouseLeave={handleMouseLeaveAuthor}
              onClick={(e) => personagem.usuario_id && handleAuthorRedirect(e, personagem.usuario_id)}
            >
              <i className="fa-regular fa-user" />
              @{nome?.nome || "Carregando..."}
            </button>

            {activeProfile && showMiniProfile && (
              <div className={styles.popoverWrapper}>
                <MiniProfile
                  usuarioId={activeProfile.usuarioId}
                  nome={activeProfile.nome}
                  foto={activeProfile.foto}
                  descricao={activeProfile.descricao}
                  frame={activeProfile.frame}
                  is_online={activeProfile.is_online}
                  onClose={() => {
                    setActiveProfile(null);
                    setShowMiniProfile(false);
                  }}
                />
              </div>
            )}
          </div>

        </article>
      )}

      {activeTab === 'histórico' && (
        <article className={styles.conteudoConfiguracoes}>

          <div className={styles.campo}>
            <span className={styles.labelCampo}>Tempo de conversa</span>
            <p>
              {totalSeconds > 0 ? formatTime(totalSeconds) : "Nenhuma conversa registrada ainda."}
            </p>
          </div>

          <div className={styles.campoMensagensFixadas}>
            <span className={styles.labelCampo}>Mensagens fixadas</span>

            {pinnedMessages.length > 0 ? (
              <div className={styles.pinnedMessageWrapper}>
                {pinnedMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={styles.pinnedItem}>

                      {isUser && <div className={styles.pinnedSpacer} />}

                      {isUser && (
                        <button className={styles.btnUnpin} onClick={() => onUnpin(msg)} title="Desafixar">
                          <BsPin size={13} />
                        </button>
                      )}

                      <div className={`${styles.pinnedBubble} ${isUser ? styles.pinnedBubbleUser : styles.pinnedBubbleBot}`}>
                        <div style={{ wordBreak: 'break-word' }}>
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

                      {!isUser && (
                        <button className={styles.btnUnpin} onClick={() => onUnpin(msg)} title="Desafixar">
                          <BsPin size={13} />
                        </button>
                      )}

                      {!isUser && <div className={styles.pinnedSpacer} />}

                    </div>
                  );
                })}
              </div>
            ) : (
              <p>Nenhuma mensagem fixada.</p>
            )}
          </div>

        </article>
      )}

    </div>
  );
};

export default CharacterProfileTabs;