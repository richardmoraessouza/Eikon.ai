"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { FiAward, FiTarget, FiTrendingUp, FiUser } from 'react-icons/fi';
import styles from './ProgressModal.module.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { useMissions } from '@/hooks/useMissions/UseMissions';
import MissionsTab from './Taps/MissionsTab/MissionsTab';
import OverviewTab from './Taps/OverviewTab/OverviewTab';
import TabsSpecialMissions from './Taps/TabsSpecialMissions/TabsSpecialMissions';
import PaymentModal from '@/components/navigation/PaymentModal/PaymentModal';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MissionTab = 'nivel' | 'principais' | 'especiais';

const TABS = [
  { id: 'nivel', label: 'Nível e XP', icon: <FiTrendingUp size={15} /> },
  { id: 'principais', label: 'Missões principais', icon: <FiTarget size={15} /> },
  { id: 'especiais', label: 'Missões especiais', icon: <FiAward size={15} /> },
] as const;

const LEVEL_TICKS = Array.from({ length: 100 }, (_, i) => i + 1);
const TICK_SPACING = 64;
const TRACK_WIDTH = (LEVEL_TICKS.length - 1) * TICK_SPACING;

function xpParaNivel(nivel: number) {
  return nivel < 10 ? 200 + (nivel - 1) * 100 : 1000;
}

const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose }) => {
  const { usuarioId } = useAuth();
  const usuarioIdNum = useMemo(() => (usuarioId ? Number(usuarioId) : undefined), [usuarioId]);
  const { getUserLevel, getUserXp } = useMissions(usuarioIdNum);

  const [activeTab, setActiveTab] = useState<MissionTab>('nivel');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xpAtual, setXpAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const currentLevelNum = Number(currentLevel) || 1;
  const xpAtualNum = Number(xpAtual) || 0;
  const xpNecessario = xpParaNivel(currentLevelNum);
  const pct = Math.min(Math.round((xpAtualNum / Math.max(xpNecessario, 1)) * 100), 100);
  const fillPx = Math.min((currentLevelNum - 1) * TICK_SPACING, TRACK_WIDTH);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (usuarioIdNum == null) return;

    const userIdNumber = usuarioIdNum;
    let cancelled = false;

    async function loadProgress() {
      try {
        setLoading(true);
        const [nivel, xp] = await Promise.all([
          getUserLevel(userIdNumber),
          getUserXp(userIdNumber),
        ]);

        if (cancelled) return;
        setCurrentLevel(Number(nivel) || 1);
        setXpAtual(Number(xp) || 0);
      } catch (error) {
        console.error('Erro ao carregar progresso do modal de missões:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [getUserLevel, getUserXp, usuarioIdNum]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'nivel':
        return (
          <OverviewTab
            currentLevel={currentLevelNum}
            xpAtual={xpAtualNum}
            xpNecessario={xpNecessario}
            pct={pct}
            fillPx={fillPx}
            loading={loading}
            onOpenPremiumModal={() => setIsPaymentModalOpen(true)}
          />
        );
      case 'principais':
        return <MissionsTab />;
      case 'especiais':
        return <TabsSpecialMissions />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay} style={{ zIndex: 99998 }}>
      <div className={styles.backdropClick} onClick={onClose} aria-hidden="true" />
      <div className={styles.modalContainer}>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Fechar">✕</button>

        <aside className={styles.sidebar}>
          <div className={styles.containerBtn}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MissionTab)}
                className={`${styles.navButton} ${activeTab === tab.id ? styles.active : ''}`}
              >
                <span className={styles.spanFlexCenter}>
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.userPill}>
              <FiUser size={14} />
              <span>{usuarioId ? 'Conta ativa' : 'Entre para ver'}</span>
            </div>
          </div>
        </aside>

        <div className={styles.rightWrapper}>
          <div className={styles.content}>{renderContent()}</div>
        </div>
      </div>

      {isPaymentModalOpen && (
        <PaymentModal onClose={() => setIsPaymentModalOpen(false)} />
      )}
    </div>
  );
};

export default MissionsModal;
