'use client';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './HeroBanner.module.css';
import characters from './characters.json';

const INTERVAL_MS = 6000;
const FADE_MS = 400;

export const HeroBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % characters.length);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const char = characters[activeIndex];

  return (
    <section className={styles.hero}>
      <div className={styles.left}>

        <h1 className={styles.title}>
          Converse com{' '}
          <span className={styles.gradientText}>Personagens IA</span>
        </h1>

        <p className={styles.description}>
          Explore personagens criados pela comunidade ou crie o seu próprio companheiro virtual em segundos. Romance, RPG, Anime, Fantasia e muito mais.
        </p>

        <div className={styles.btnGroup}>
          <Link to={'/create-character'}  className={styles.primaryButton}><i className="fa-solid fa-masks-theater"></i> Criar personagem</Link>
          <button className={styles.secondaryButton}>Explorar →</button>
        </div>

        {/* <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>50K+</span>
            <span className={styles.statLabel}>Usuários ativos</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>12K+</span>
            <span className={styles.statLabel}>Personagens</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>4.9★</span>
            <span className={styles.statLabel}>Avaliação</span>
          </div>
        </div> */}
      </div>

      <div className={styles.right}>
        <img
          src={char.image}
          alt={char.name}
          className={`${styles.heroImage} ${fading ? styles.fadeOut : styles.fadeIn}`}
        />

        <div className={`${styles.chatPreview} ${fading ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.chatHeader}>
            <img src={char.image} alt={char.name} className={styles.chatHeaderAvatar} />
            <div className={styles.chatHeaderInfo}>
              <span className={styles.chatHeaderName}>{char.name}</span>
              <span className={styles.chatHeaderStatus}>
                <span className={styles.statusDot} />
                online agora
              </span>
            </div>
          </div>

          {char.messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.chatMsg} ${msg.from === 'user' ? styles.chatMsgUser : ''}`}
            >
              {msg.from === 'char' && (
                <img src={char.image} alt={char.name} className={styles.avatar} />
              )}
              {msg.from === 'user' && (
                <img src="/image/semPerfil.jpg" alt="Você" className={styles.avatar} />
              )}
              <div
                className={`${styles.bubble} ${
                  msg.from === 'char' ? styles.bubbleElena : styles.bubbleUser
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};