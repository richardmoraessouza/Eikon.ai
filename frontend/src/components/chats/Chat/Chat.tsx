"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Chat.module.css';
import { useCharacters } from '@/hooks/useCharacters/useCharacters';
import type { CharacterbyId } from '@/types/characters/characters';
import { useTheme } from '@/hooks/useTheme/useTheme';
import { useChat } from '@/hooks/useChat/useChat';
import { ChatMessage } from '@/components/chats/ChatMessage/ChatMessage';
import { ChatInput } from '@/components/chats/ChatInput/ChatInput';
import { PinnedMessage } from '@/components/chats/PinnedMessage/PinnedMessage';
import ProfilePerson from '@/components/character/CharacteProfile/CharacteProfile';
import { useAuth } from '@/hooks/AuthContext/AuthContext';
import { ChatMessageSkeleton } from '@/components/chats/ChatMessage/ChatMessageSkeleton/ChatMessageSkeleton';
import { useMenu } from '@/hooks/MenuContext/MenuContext';

function Chat() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { usuarioId } = useAuth();
  const { menuOpen } = useMenu();

  const { searchCharacterById } = useCharacters();
  const [character, setCharacter] = useState<CharacterbyId | null>(null);

  const [perfilPerson, setPerfilPerson] = useState(false);

  const [personId, setPersonId] = useState<number>(() => {
    const n = id != null ? Number(id) : NaN;
    return isNaN(n) ? 29 : n;
  });

  const idNum = id != null ? Number(id) : NaN;
  const personagemId = !isNaN(idNum) ? idNum : personId;

  useEffect(() => {
    if (id != null) {
      const parsed = Number(id);
      if (!isNaN(parsed) && parsed !== personId) setPersonId(parsed);
    }
  }, [id]);

  useTheme();

  useEffect(() => {
    if (!personagemId || isNaN(personagemId)) return;
    searchCharacterById(personagemId).then(setCharacter).catch(console.error);
  }, [personagemId]);

  const {
    message,
    setMessage,
    replyTo,
    setReplyTo,
    isLoadingHistory,
    chatHistory,
    isLoading,
    isLoadingMore,
    chatEndRef,
    scrollContainerRef,
    handleScroll,
    enviarMensagem,
    handleKeyPress,
    handleDeleteMessage,
    handleTogglePinMessage,
  } = useChat(personagemId);

  const pinnedMessage = chatHistory.find(m => m.pinned) ?? null;

  useEffect(() => {
    if (replyTo && scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 60, behavior: 'smooth' });
    }
  }, [replyTo]);

  return (
    <>
      <ProfilePerson
        personagemId={id ? Number(id) : null}
        menuOpen={menuOpen}
        usuarioIdAtual={usuarioId || null}
        perfilPerson={perfilPerson}
        setPerfilPerson={setPerfilPerson}
      />

      <div className={`${styles.containerChat} ${menuOpen ? styles.menuAberto : ''} ${perfilPerson ? styles.perfilAberto : ''}`}>
        <main className={`${styles.chat} flex flex-col`}>
          <div className={styles.containerEmCima} />

          {pinnedMessage && (
            <PinnedMessage
              msg={pinnedMessage}
              characterName={character?.nome ?? 'Personagem'}
              menuOpen={menuOpen}
              onUnpin={() => handleTogglePinMessage(pinnedMessage)}
            />
          )}

          <section
            className={styles.conversas}
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{
              overflowY: 'auto',
              paddingBottom: replyTo ? '80px' : '20px'
            }}
          >
            {isLoadingMore && (
              <div className="w-full text-center text-xs text-zinc-500 py-2 italic animate-pulse">
                Loading older history...
              </div>
            )}

            {isLoadingHistory ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ChatMessageSkeleton key={i} isUser={i % 3 === 0} bubbleWidth={50 + (i % 3) * 15} />
              ))
            ) : (
              chatHistory.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  characterName={character?.nome ?? 'Personagem'}
                  onReply={(msg) => setReplyTo({ sender: msg.sender, text: msg.text, id: msg.id })}
                  onDelete={(msg) => handleDeleteMessage(msg)}
                  onPin={(msg) => handleTogglePinMessage(msg)}
                />
              ))
            )}

            {isLoading && (
              <article className={`${styles.message} ${styles.botMessage}`}>
                <div className={styles.bubble}>
                  <div className={styles.typingIndicator}>
                    <span /><span /><span />
                  </div>
                </div>
              </article>
            )}

            <div className={styles.espaco2} />
            <div ref={chatEndRef} />
          </section>

          <ChatInput
            message={message}
            characterName={character?.nome ?? 'Personagem'}
            menuOpen={menuOpen}
            perfilAberto={perfilPerson}
            isLoading={isLoading}
            replyTo={replyTo}
            onChange={(val) => setMessage(val)}
            onSend={() => enviarMensagem()}
            onKeyPress={(e) => handleKeyPress(e)}
            onCancelReply={() => setReplyTo(null)}
          />
        </main>
      </div>
    </>
  );
}

export default Chat;