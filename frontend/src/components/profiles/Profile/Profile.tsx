'use client'; // Necessário no Next.js devido ao uso de hooks (useState) e interações de modais

import { useState } from 'react';
import Image from 'next/image'; // Substitui as tags <img> nativas
import styles from './Profile.module.css';
import { useAuth } from '../../../hooks/AuthContext/AuthContext';
import { normalizeFrame } from '../../../utils/frame';
import { useSeguir } from '../../../hooks/useSocial/useSocial';
import ModalSeguidores from '../ModalSeguidores/ModalSeguidores';
import TapsProfile from '../TapsProfile/TapsProfile';

function Profile() {
  const {
    usuario: nome,
    usuarioId,
    fotoPerfil,
    token,
    descricao,
    frame,
  } = useAuth();

  const { seguidores, seguindo } = useSeguir(usuarioId, token);

  const [abrirSeguidores, setAbrirSeguidores] = useState(false);
  const [abrirSeguindo, setAbrirSeguindo] = useState(false);

  const frameAtivo = normalizeFrame(frame);
  const caminhoFrame = frameAtivo ? `/image/frames/${frameAtivo}` : null;

  return (
    <main className={styles.containerPerfil}>
      <section className={styles.hero}>

        {/* AVATAR + FRAME */}
        <div className={styles.avatarWrapper} style={{ position: 'relative' }}>
          <Image
            src={fotoPerfil || '/image/semPerfil.jpg'}
            alt="Foto de perfil"
            className={styles.avatar}
            width={120} // Ajuste conforme o tamanho do avatar no seu Profile.module.css
            height={120}
            priority // Carrega a foto principal com prioridade máxima
            style={{ objectFit: 'cover' }}
          />
          {caminhoFrame && (
            <Image
              src={caminhoFrame}
              alt="Frame"
              className={styles.frame}
              width={128} // Ligeiramente maior para sobrepor as bordas do avatar perfeitamente
              height={128}
              priority
            />
          )}
        </div>

        {/* NOME */}
        <h1 className={styles.nome}>{nome}</h1>

        {/* DESCRIÇÃO */}
        {descricao && (
          <p className={styles.descricao}>{descricao}</p>
        )}

        {/* STATS */}
        <div className={styles.stats}>
          <button className={styles.statBtn} onClick={() => setAbrirSeguidores(true)} type="button">
            <span className={styles.statNumber}>{seguidores.length}</span>
            <span className={styles.statLabel}>Seguidores</span>
          </button>
          <div className={styles.statDivider} />
          <button className={styles.statBtn} onClick={() => setAbrirSeguindo(true)} type="button">
            <span className={styles.statNumber}>{seguindo.length}</span>
            <span className={styles.statLabel}>Seguindo</span>
          </button>
        </div>

      </section>

      <TapsProfile />

      {abrirSeguidores && (
        <ModalSeguidores
          tipo="seguidores"
          lista={seguidores}
          onClose={() => setAbrirSeguidores(false)}
          usuario={Number(usuarioId)}
          usuarioLogado={Number(usuarioId)}
        />
      )}
      {abrirSeguindo && (
        <ModalSeguidores
          tipo="seguindo"
          lista={seguindo}
          onClose={() => setAbrirSeguindo(false)}
          usuario={Number(usuarioId)}
          usuarioLogado={Number(usuarioId)}
        />
      )}
    </main>
  );
}

export default Profile;