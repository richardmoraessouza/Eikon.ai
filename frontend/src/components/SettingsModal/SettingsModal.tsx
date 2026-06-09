import React, { useState, useEffect } from 'react';
import styles from './SettingsModal.module.css';
import { FiImage, FiLogIn, FiSliders, FiUser } from "react-icons/fi";
import TapsProfileEdit from './Taps/TapsProfileEdit/TapsProfileEdit';
import TapsPreferencesTheme from './Taps/TapsPreferencesTheme/TapsPreferencesTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
   { id: 'perfil', label: 'Perfil', icon: <FiUser size={15} /> },
  { id: 'conta', label: 'Conta', icon: <FiLogIn size={15} /> },
  { id: 'preferencias', label: 'Preferências', icon: <FiSliders size={15} /> },
  { id: 'molduras', label: 'Molduras', icon: <FiImage size={15} /> },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('conta');
  const [activeProfileSubTab, setActiveProfileSubTab] = useState<string>('perfil');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'perfil':
        if (!isProfileOpen) return null;
        return (
          <div className="flex-1">
            {activeProfileSubTab === 'perfil' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Perfil</h2>
                <TapsProfileEdit />
              </div>
            )}
            {activeProfileSubTab === 'moldura' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Moldura</h2>
                <p style={{ color: 'var(--settings-text-muted, #a1a1aa)' }} className="text-sm">
                  Escolha as molduras de avatar disponíveis para o seu perfil.
                </p>
              </div>
            )}
            {activeProfileSubTab === 'miniPerfil' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">MiniPerfil</h2>
                <p style={{ color: 'var(--settings-text-muted, #a1a1aa)' }} className="text-sm">
                  Configure seu miniPerfil.
                </p>
              </div>
            )}
          </div>
        );
      case 'conta':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Conta</h2>
            <div
              style={{
                backgroundColor: 'var(--settings-active, #202024)',
                border: '1px solid var(--settings-border, #3f3f46)',
              }}
              className="p-4 rounded-xl flex justify-between items-center"
            >
              <div>
                <span style={{ color: 'var(--settings-text-muted, #a1a1aa)' }} className="text-xs block mb-1">
                  O seu plano atual
                </span>
                <span className="text-base font-semibold">Grátis</span>
              </div>
              <button className="bg-[#007aff] hover:bg-blue-600 font-medium text-sm px-5 py-2 rounded-full transition-colors text-white">
                Atualizar
              </button>
            </div>
          </div>
        );
      case 'preferencias':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Preferências</h2>
            <TapsPreferencesTheme />
          </div>
        );
      case 'molduras':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Molduras</h2>
            <p style={{ color: 'var(--settings-text-muted, #a1a1aa)' }} className="text-sm">
              Escolha as molduras de avatar disponíveis para o seu perfil.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm" style={{ zIndex: 99998 }}>
      
      {/* Overlay para fechar clicando fora */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container Principal */}
      <div
        className={`${styles.modalContainer} relative flex w-full max-w-4xl h-[560px] rounded-2xl overflow-hidden shadow-2xl`}
        style={{ flexDirection: 'row' }}
      >
        {/* Botão Fechar */}
        <button onClick={onClose} className={styles.closeBtn} aria-label="Fechar">
          ✕
        </button>

        {/* ── SIDEBAR (desktop/tablet) ── */}
        <aside className={styles.sidebar}>
          <div className={styles.containerBtn}>
            {TABS.map((tab) => (
              <div key={tab.id}>
                <button
                  onClick={() => {
                    if (tab.id === 'perfil') {
                      setIsProfileOpen(!isProfileOpen);
                      if (!isProfileOpen) {
                        setActiveTab(tab.id);
                        setActiveProfileSubTab('perfil');
                      }
                    } else {
                      setActiveTab(tab.id);
                      setIsProfileOpen(false);
                    }
                  }}
                  className={`${styles.navButton} ${activeTab === tab.id && tab.id !== 'perfil' ? styles.active : ''}`}
                >
                  {tab.label}
                </button>
                
                {/* Sub-abas de Perfil */}
                {isProfileOpen && tab.id === 'perfil' && (
                  <div className={`pl-4 flex flex-col gap-2 mt-1 ${styles.subNav}`}>
                    {['perfil', 'moldura', 'miniPerfil'].map((subTab) => (
                      <button
                        key={subTab}
                        onClick={() => {
                          setActiveTab('perfil');
                          setActiveProfileSubTab(subTab);
                        }}
                        className="text-left px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                          color: activeProfileSubTab === subTab 
                            ? 'var(--settings-text, #fff)' 
                            : 'var(--settings-text-muted, #a1a1aa)',
                          backgroundColor: activeProfileSubTab === subTab 
                            ? 'var(--settings-hover, #3f3f46)'
                            : 'transparent',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (activeProfileSubTab !== subTab) {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'var(--settings-hover, #3f3f46)';
                            (e.target as HTMLButtonElement).style.color = 'var(--settings-text, #fff)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeProfileSubTab !== subTab) {
                            (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                            (e.target as HTMLButtonElement).style.color = 'var(--settings-text-muted, #a1a1aa)';
                          }
                        }}
                      >
                        {subTab === 'perfil' ? 'Perfil' : subTab === 'moldura' ? 'Moldura' : 'MiniPerfil'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── WRAPPER direita: tab bar (mobile) + conteúdo ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          
          {/* Tab bar horizontal — visível só no mobile via CSS */}
          <nav className={styles.tabBar} aria-label="Navegação de configurações">
            <div className={styles.tabBarInner} style={{ display: 'flex', alignItems: 'center' }}>
              {TABS.map((tab) => (
                <div key={tab.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => {
                      if (tab.id === 'perfil') {
                        setIsProfileOpen(!isProfileOpen);
                        if (!isProfileOpen) {
                          setActiveTab(tab.id);
                          setActiveProfileSubTab('perfil');
                        }
                      } else {
                        setActiveTab(tab.id);
                        setIsProfileOpen(false);
                      }
                    }}
                    className={`${styles.tabButton} ${activeTab === tab.id && tab.id !== 'perfil' ? styles.active : ''}`}
                  >
                    {tab.label}
                  </button>

                  {/* Sub-abas de Perfil ao lado do botão principal */}
                  {isProfileOpen && tab.id === 'perfil' && (
                    <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--settings-border, #27272a)', paddingLeft: '8px', flexShrink: 0 }}>
                      {['perfil', 'moldura', 'miniPerfil'].map((subTab) => (
                        <button
                          key={subTab}
                          onClick={() => {
                            setActiveTab('perfil');
                            setActiveProfileSubTab(subTab);
                          }}
                          className={`${styles.tabButton} ${activeProfileSubTab === subTab ? styles.active : ''}`}
                          style={{ fontSize: '0.75rem', padding: '8px 12px', minWidth: 'auto', transition: 'all 0.3s ease' }}
                        >
                          {subTab === 'perfil' ? 'Perfil' : subTab === 'moldura' ? 'Moldura' : 'MiniPerfil'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Conteúdo dinâmico */}
          <div className={`${styles.content} flex-1`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;