"use client"; // Obrigatório devido aos estados locais de abas e listeners de teclado ('keydown')

import React, { useState, useEffect } from 'react';
import { FiLogIn, FiSliders, FiUser, FiImage, FiLayout, FiChevronDown } from "react-icons/fi";
import TapsFrames from './Taps/TapsFrames/TapsFrames';
import TapsProfileEdit from './Taps/TapsProfileEdit/TapsProfileEdit';
import TapsPreferencesTheme from './Taps/TapsPreferencesTheme/TapsPreferencesTheme';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: <FiUser size={15} /> },
  { id: 'conta', label: 'Conta', icon: <FiLogIn size={15} /> },
  { id: 'preferencias', label: 'Preferências', icon: <FiSliders size={15} /> },
];

const PROFILE_SUB_TABS = [
  { id: 'perfil', label: 'Perfil', icon: <FiUser size={13} /> },
  { id: 'frame', label: 'Frame', icon: <FiImage size={13} /> },
  { id: 'miniPerfil', label: 'MiniPerfil', icon: <FiLayout size={13} /> },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('conta');
  const [activeProfileSubTab, setActiveProfileSubTab] = useState<string>('perfil');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

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
          <div className={styles.flex1}>
            {activeProfileSubTab === 'perfil' && (
              <div>
                <h2 className={styles.titleTab}>Perfil</h2>
                <TapsProfileEdit />
              </div>
            )}
            {activeProfileSubTab === 'frame' && (
              <div>
                <TapsFrames />
              </div>
            )}
            {activeProfileSubTab === 'miniPerfil' && (
              <div>
                <h2 className={styles.titleTab}>MiniPerfil</h2>
                <p style={{ color: 'var(--settings-text-muted, #a1a1aa)' }} className={styles.textSm}>
                  Configure seu miniPerfil.
                </p>
              </div>
            )}
          </div>
        );
      case 'conta':
        return (
          <div>
            <h2 className={styles.titleTab}>Conta</h2>
            <div
              style={{
                backgroundColor: 'var(--settings-active, #202024)',
                border: '1px solid var(--settings-border, #3f3f46)',
              }}
              className={styles.accountCard}
            >
              <div>
                <span style={{ color: 'var(--settings-text-muted, #a1a1aa)' }} className={styles.planCaption}>
                  O seu plano atual
                </span>
                <span className={styles.planType}>Grátis</span>
              </div>
              <button className={styles.btnUpgrade}>
                Atualizar
              </button>
            </div>
          </div>
        );
      case 'preferencias':
        return (
          <div>
            <h2 className={styles.titleTab}>Preferências</h2>
            <TapsPreferencesTheme />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 99998 }}>
      
      <div className={styles.backdropClick} onClick={onClose} aria-hidden="true" />

      <div className={`${styles.modalContainer}`} style={{ flexDirection: 'row' }}>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Fechar">✕</button>

        {/* ── SIDEBAR ── */}
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
                  <span className={styles.spanFlexCenter}>
                    {tab.icon}
                    {tab.label}
                  </span>
                  {tab.id === 'perfil' && (
                    <FiChevronDown
                      size={13}
                      className={styles.arrowIcon}
                      style={{
                        transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        marginLeft: 'auto',
                      }}
                    />
                  )}
                </button>

                {isProfileOpen && tab.id === 'perfil' && (
                  <div className={styles.subNav}>
                    {PROFILE_SUB_TABS.map((subTab) => (
                      <button
                        key={subTab.id}
                        onClick={() => {
                          setActiveTab('perfil');
                          setActiveProfileSubTab(subTab.id);
                        }}
                        className={styles.subTabButton}
                        style={{
                          color: activeProfileSubTab === subTab.id
                            ? 'var(--settings-text, #fff)'
                            : 'var(--settings-text-muted, #a1a1aa)',
                          backgroundColor: activeProfileSubTab === subTab.id
                            ? 'var(--settings-hover, #3f3f46)'
                            : 'transparent',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          if (activeProfileSubTab !== subTab.id) {
                            e.currentTarget.style.backgroundColor = 'var(--settings-hover, #3f3f46)';
                            e.currentTarget.style.color = 'var(--settings-text, #fff)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeProfileSubTab !== subTab.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--settings-text-muted, #a1a1aa)';
                          }
                        }}
                      >
                        {subTab.icon}
                        {subTab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── WRAPPER direita ── */}
        <div className={styles.rightWrapper}>

          {/* Tab bar mobile */}
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
                    <span className={styles.spanFlexCenterGap1}>
                      {tab.icon}
                      {tab.label}
                    </span>
                  </button>

                  {isProfileOpen && tab.id === 'perfil' && (
                    <div style={{ display: 'flex', gap: '6px', borderLeft: '1px solid var(--settings-border, #27272a)', paddingLeft: '8px', flexShrink: 0 }}>
                      {PROFILE_SUB_TABS.map((subTab) => (
                        <button
                          key={subTab.id}
                          onClick={() => {
                            setActiveTab('perfil');
                            setActiveProfileSubTab(subTab.id);
                          }}
                          className={`${styles.tabButton} ${activeProfileSubTab === subTab.id ? styles.active : ''}`}
                          style={{ fontSize: '0.75rem', padding: '8px 10px', minWidth: 'auto', transition: 'all 0.2s ease' }}
                        >
                          <span className={styles.spanFlexCenterGap1}>
                            {subTab.icon}
                            {subTab.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Conteúdo dinâmico */}
          <div className={styles.content}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;