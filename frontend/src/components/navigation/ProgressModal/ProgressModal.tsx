"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { FiTarget, FiTrendingUp } from 'react-icons/fi';
import styles from './ProgressModal.module.css';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { useMissions } from '@/hooks/useMissions/UseMissions';
import MissionsTab from './Taps/MissionsTab/MissionsTab';
import OverviewTab from './Taps/OverviewTab/OverviewTab';
// TabsSpecialMissions removed
import PaymentModal from '@/components/navigation/PaymentModal/PaymentModal';
import { getFrameUnlocksService } from '@/services/users/userService';
import type { FrameUnlock } from '@/types/users/users';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MissionTab = 'nivel' | 'principais';

const TABS = [
  { id: 'nivel', label: 'Nível e XP', icon: <FiTrendingUp size={15} /> },
  { id: 'principais', label: 'Missões principais', icon: <FiTarget size={15} /> },
  // 'especiais' tab removed with component
] as const;

const LEVEL_TICKS = Array.from({ length: 100 }, (_, i) => i + 1);
const TICK_SPACING = 64;
const TRACK_WIDTH = (LEVEL_TICKS.length - 1) * TICK_SPACING;

function xpParaNivel(nivel: number) {
  return nivel < 10 ? 200 + (nivel - 1) * 100 : 1000;
}

const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose }) => {
  const { usuarioId, token } = useAuth();
  const usuarioIdNum = useMemo(() => (usuarioId ? Number(usuarioId) : undefined), [usuarioId]);
  const { getUserLevel, getUserXp } = useMissions(usuarioIdNum);

  const [activeTab, setActiveTab] = useState<MissionTab>('nivel');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xpAtual, setXpAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [frameUnlocks, setFrameUnlocks] = useState<FrameUnlock[]>([]);

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
    if (usuarioIdNum == null) {
      setFrameUnlocks([]);
      return;
    }

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

  useEffect(() => {
    if (usuarioIdNum == null) {
      setFrameUnlocks([]);
      return;
    }

    const userIdNumber = usuarioIdNum;
    let cancelled = false;

    async function loadFrameUnlocks() {
      try {
        const response = await getFrameUnlocksService(userIdNumber, token ?? undefined);
        if (!cancelled) setFrameUnlocks(response?.frames ?? []);
      } catch (error) {
        console.error('Erro ao carregar desbloqueios de molduras:', error);
        if (!cancelled) setFrameUnlocks([]);
      }
    }

    loadFrameUnlocks();

    return () => {
      cancelled = true;
    };
  }, [token, usuarioIdNum]);

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
            frameUnlocks={frameUnlocks}
            onOpenPremiumModal={() => setIsPaymentModalOpen(true)}
          />
        );
      case 'principais':
        return <MissionsTab />;
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

        </aside>

        <div className={styles.rightWrapper}>
          <div className={styles.topTabBar}>
            <div className={styles.topTabBarInner}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MissionTab)}
                  className={`${styles.topTabButton} ${activeTab === tab.id ? styles.topTabButtonActive : ''}`}
                >
                  <span className={styles.spanFlexCenter}>
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

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
