"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiPlusCircle } from "react-icons/fi";
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
          <Link href='/create-character' className={styles.primaryButton}>
            <FiPlusCircle /> Criar personagem
          </Link>
          <button className={styles.secondaryButton}>
            <FiSearch /> Explorar
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <Image
          src={char.image}
          alt={char.name}
          className={`${styles.heroImage} ${fading ? styles.fadeOut : styles.fadeIn}`}
          width={400}
          height={600}
        />

        <div className={`${styles.chatPreview} ${fading ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.chatHeader}>
            <Image src={char.image} alt={char.name} className={styles.chatHeaderAvatar} width={40} height={40} />
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
                <Image src={char.image} alt={char.name} className={styles.avatar} width={40} height={40} />
              )}
              {msg.from === 'user' && (
                <Image src="/image/semPerfil.jpg" alt="Você" className={styles.avatar} width={40} height={40} />
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