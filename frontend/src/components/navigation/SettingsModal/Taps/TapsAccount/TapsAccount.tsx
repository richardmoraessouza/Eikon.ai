"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext/AuthContext';
import { useMissions } from '@/hooks/useMissions/UseMissions';
import PaymentModal from '@/components/navigation/PaymentModal/PaymentModal';
import styles from './TapsAccount.module.css';

const TapsAccount = () => {
  const { usuarioId } = useAuth();
  const { getUserLevel, getUserXp } = useMissions(usuarioId ?? undefined);
  const [level, setLevel] = useState<number | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProgress = async () => {
      if (!usuarioId) {
        if (isActive) {
          setLevel(1);
          setXp(0);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const [nivel, experiencia] = await Promise.all([
          getUserLevel(usuarioId),
          getUserXp(usuarioId),
        ]);

        if (!isActive) return;

        setLevel(Number(nivel) || 1);
        setXp(Number(experiencia) || 0);
      } catch (error) {
        console.error('Erro ao carregar progresso da conta:', error);
        if (isActive) {
          setLevel(1);
          setXp(0);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isActive = false;
    };
  }, [getUserLevel, getUserXp, usuarioId]);

  return (
    <div className={styles.accountContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>Seu progresso</p>
            <h3 className={styles.title}>Conta</h3>
          </div>
          <button type="button" className={styles.upgradeButton} onClick={() => setIsPaymentOpen(true)}>
            Ver planos
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Nível</span>
            <strong className={styles.statValue}>{loading ? '—' : level ?? 1}</strong>
          </div>

          <div className={styles.divider} aria-hidden="true" />

          <div className={styles.statBox}>
            <span className={styles.statLabel}>XP</span>
            <strong className={styles.statValue}>{loading ? '—' : xp ?? 0}</strong>
          </div>
        </div>

        <p className={styles.helper}>Acompanhe seu progresso enquanto usa o Eikon.</p>
      </div>

      {isPaymentOpen && <PaymentModal onClose={() => setIsPaymentOpen(false)} />}
    </div>
  );
};

export default TapsAccount;