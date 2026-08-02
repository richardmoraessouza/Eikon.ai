"use client";

import { useEffect, useRef, useState } from 'react';
import { FiPhone, FiMoreVertical, FiShare2, FiTrash2, FiUser } from 'react-icons/fi';
import styles from './ChatHeaderActions.module.css';

interface ChatHeaderActionsProps {
  onIniciarChamada: () => void;
  onVerPerfil: () => void;
  onCompartilharPersonagem: () => void | Promise<void>;
  onLimparConversa: () => void | Promise<void>;
  isClearing: boolean;
  className?: string;
}

export function ChatHeaderActions({
  onIniciarChamada,
  onVerPerfil,
  onCompartilharPersonagem,
  onLimparConversa,
  isClearing,
  className = '',
}: ChatHeaderActionsProps) {
  const [menuOpcoesAberto, setMenuOpcoesAberto] = useState(false);
  const menuOpcoesRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de 3 pontos ao clicar fora dele
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (menuOpcoesRef.current && !menuOpcoesRef.current.contains(e.target as Node)) {
        setMenuOpcoesAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const handleVerPerfil = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpcoesAberto(false);
    onVerPerfil();
  };

  const handleCompartilhar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpcoesAberto(false);
    await onCompartilharPersonagem();
  };

  const handleLimpar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpcoesAberto(false);
    await onLimparConversa();
  };

  return (
    <div
      className={`${className} flex items-center justify-between gap-2`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onIniciarChamada();
        }}
        className={`${styles.callButton} flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer`}
        title="Iniciar ligação de voz"
      >
        <FiPhone size={18} />
      </button>

      <div className="relative" ref={menuOpcoesRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpcoesAberto((prev) => !prev);
          }}
          className={`${styles.menuButton} flex items-center justify-center p-2 rounded-full transition-colors cursor-pointer`}
          title="Mais opções"
        >
          <FiMoreVertical size={18} />
        </button>

        {menuOpcoesAberto && (
          <div className={`${styles.dropdown} absolute right-0 top-full mt-2 w-56 rounded-xl  z-50`}>
            <button
              onClick={handleVerPerfil}
              className={`${styles.dropdownItem} w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer`}
            >
              <FiUser size={16} />
              Ver perfil completo
            </button>

            <button
              onClick={handleCompartilhar}
              className={`${styles.dropdownItem} w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer`}
            >
              <FiShare2 size={16} />
              Compartilhar personagem
            </button>

            <button
              onClick={handleLimpar}
              disabled={isClearing}
              className={`${styles.dropdownItemDanger} w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer`}
            >
              <FiTrash2 size={16} />
              {isClearing ? 'Limpando...' : 'Limpar conversa'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}