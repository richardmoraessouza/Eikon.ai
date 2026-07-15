"use client";

import React from 'react';
import styles from './TabsSpecialMissions.module.css';

const SPECIAL_MISSIONS = [
  {
    id: 1,
    title: 'Cresça a comunidade',
    description: 'Convide novos usuários e ajude o projeto a ganhar força.',
    progress: 2,
    target: 5,
    rewardType: 'frame' as const,
    rewardName: 'Moldura Aurora',
    status: 'Em andamento',
    duration: '3 semanas',
  },
  {
    id: 2,
    title: 'Domine as conversas',
    description: 'Complete sessões avançadas com personagens diferentes.',
    progress: 1,
    target: 3,
    rewardType: 'badge' as const,
    rewardName: 'Insígnia Mestre',
    status: 'Aguardando',
    duration: '2 semanas',
  },
  {
    id: 3,
    title: 'Construa seu perfil',
    description: 'Finalize uma coleção completa de personalização e conquistas.',
    progress: 4,
    target: 6,
    rewardType: 'frame' as const,
    rewardName: 'Moldura Eclipse',
    status: 'Em andamento',
    duration: '4 semanas',
  },
];

const TabsSpecialMissions: React.FC = () => (
  <div className={styles.contentStack}>
    <div className={styles.sectionHeader}>
      <h3>Missões especiais</h3>
      <span>Mais longas e recompensadoras</span>
    </div>
    <div className={styles.specialList}>
      {SPECIAL_MISSIONS.map((mission) => (
        <article key={mission.id} className={styles.specialCard}>
          <div className={styles.specialIcon}>{mission.rewardType === 'frame' ? '🖼️' : '🏅'}</div>
          <div className={styles.specialContent}>
            <div className={styles.specialHeader}>
              <div>
                <h4>{mission.title}</h4>
                <p>{mission.description}</p>
              </div>
              <span className={styles.rewardBadge}>{mission.rewardName}</span>
            </div>
            <div className={styles.progressRow}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }} />
              </div>
              <span>{mission.progress}/{mission.target}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>{mission.status}</span>
              <span className={styles.metaPill}>Prazo: {mission.duration}</span>
              <span className={styles.metaPill}>{mission.rewardType === 'frame' ? 'Moldura' : 'Insígnia'}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);

export default TabsSpecialMissions;
