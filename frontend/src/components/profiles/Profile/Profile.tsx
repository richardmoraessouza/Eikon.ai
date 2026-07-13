'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FiUsers, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import styles from './Profile.module.css';
import { useAuth } from '../../../contexts/AuthContext/AuthContext';
import { useSeguir } from '../../../hooks/useSocial/useSocial';
import { useMissions } from '../../../hooks/useMissions/UseMissions';
import ModalSeguidores from '../ModalSeguidores/ModalSeguidores';
import TapsProfile from '../TapsProfile/TapsProfile';
import { API_URL } from '../../../config/api';
import { FRAME_UPDATED_EVENT, getFrameImagePath, normalizeFrame, type FrameUpdatedDetail } from '../../../utils/frame';

interface UsuarioAlvo {
  id: number;
  nome: string;
  username?: string | null;
  foto_perfil: string;
  descricao: string;
  frame?: string | null;
  hide_favorite_character?: boolean;
  hide_recent_character?: boolean;
  hide_followers?: boolean;
  hide_following?: boolean;
}

// Geometria do anel de XP (SVG viewBox 0 0 100 100)
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function Profile() {
  const params = useParams();
  const router = useRouter();
  const idDaRota = params?.id as string | undefined;

  const {
    usuarioId: meuId,
    token,
    usuario: meuNome,
    username: meuUsername,
    fotoPerfil: minhaFoto,
    descricao: minhaDescricao,
    frame: meuFrame,
    hideFavoriteCharacter: meuHideFav,
    hideRecentCharacter: meuHideRec,
    loading: authLoading,
  } = useAuth();

  const [usuarioBuscado, setUsuarioBuscado] = useState<UsuarioAlvo | null>(null);

  const ehMeuProprioPerfil = !idDaRota
    || idDaRota === String(meuId)
    || idDaRota.toLowerCase() === meuUsername?.toLowerCase();

  const idAlvo = ehMeuProprioPerfil
    ? (meuId ? Number(meuId) : null)
    : (usuarioBuscado?.id ?? null);

  const [estaSeguindo, setEstaSeguindo] = useState<boolean>(false);
  const [erroPerfil, setErroPerfil] = useState<boolean>(false);
  const [nivelUsuario, setNivelUsuario] = useState<number | null>(null);
  const [xpUsuario, setXpUsuario] = useState<number | null>(null);
  const [carregandoNivel, setCarregandoNivel] = useState(false);

  const [abrirSeguidores, setAbrirSeguidores] = useState(false);
  const [abrirSeguindo, setAbrirSeguindo] = useState(false);

  const { seguidores, seguindo } = useSeguir(idAlvo, token);
  const { getUserLevel, getUserXp } = useMissions(idAlvo ?? undefined);

  useEffect(() => {
    if (ehMeuProprioPerfil) {
      const frame = window.requestAnimationFrame(() => {
        setUsuarioBuscado(null);
        setEstaSeguindo(false);
        setErroPerfil(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (!idDaRota) return;

    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      setErroPerfil(false);
    });

    const fetchData = async () => {
      try {
        const perfilRes = await axios.get(
          `${API_URL}/users/other-user/${encodeURIComponent(idDaRota)}`,
          { signal: controller.signal }
        );
        const perfil = perfilRes.data;

        setUsuarioBuscado(perfil);

        if (perfil.username && idDaRota.toLowerCase() !== perfil.username.toLowerCase()) {
          const rotaAtual = window.location.pathname;
          const rotaEsperada = `/profile/${perfil.username}`;
          if (rotaAtual !== rotaEsperada) {
            router.replace(rotaEsperada);
          }
        }

        const seguidoresRes = await axios.get(
          `${API_URL}/social/users/${perfil.id}/followers`,
          { signal: controller.signal }
        );

        const jaSegue = seguidoresRes.data?.some((s: { id: number }) => s.id === Number(meuId));
        setEstaSeguindo(jaSegue || false);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error('Erro ao carregar dados do perfil:', error);
        setErroPerfil(true);
      }
    };

    fetchData();

    return () => {
      controller.abort();
      window.cancelAnimationFrame(frame);
    };
  }, [ehMeuProprioPerfil, idDaRota, meuId, router]);

  useEffect(() => {
    if (ehMeuProprioPerfil || !idAlvo) return;

    const handler = (event: Event) => {
      const { usuarioId: updatedId, frame } = (event as CustomEvent<FrameUpdatedDetail>).detail;
      if (updatedId !== idAlvo) return;

      setUsuarioBuscado(prev =>
        prev ? { ...prev, frame: normalizeFrame(frame) } : prev
      );
    };

    window.addEventListener(FRAME_UPDATED_EVENT, handler);
    return () => window.removeEventListener(FRAME_UPDATED_EVENT, handler);
  }, [ehMeuProprioPerfil, idAlvo]);

  useEffect(() => {
    if (!idAlvo) {
      setNivelUsuario(null);
      setXpUsuario(null);
      return;
    }

    let cancelado = false;

    const carregarNivel = async () => {
      try {
        setCarregandoNivel(true);
        const [nivel, xp] = await Promise.all([
          getUserLevel(idAlvo),
          getUserXp(idAlvo),
        ]);

        if (cancelado) return;

        setNivelUsuario(Number(nivel) || 1);
        setXpUsuario(Number(xp) || 0);
      } catch (error) {
        if (!cancelado) {
          if (!axios.isAxiosError(error) || ![401, 403].includes(error.response?.status ?? 0)) {
            console.error('Erro ao carregar nível do perfil:', error);
          }
          setNivelUsuario(null);
          setXpUsuario(null);
        }
      } finally {
        if (!cancelado) {
          setCarregandoNivel(false);
        }
      }
    };

    carregarNivel();

    return () => {
      cancelado = true;
    };
  }, [getUserLevel, getUserXp, idAlvo, token]);

  const seguirUsuario = async () => {
    if (!idAlvo || !meuId || !token) return;

    try {
      if (estaSeguindo) {
        await axios.delete(`${API_URL}/social/unfollow`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { seguidor_id: Number(meuId), seguido_id: idAlvo },
        });
        setEstaSeguindo(false);
      } else {
        await axios.post(
          `${API_URL}/social/follow`,
          { seguidor_id: Number(meuId), seguido_id: idAlvo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEstaSeguindo(true);
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir usuário:', error);
    }
  };

  const nome = ehMeuProprioPerfil ? meuNome : usuarioBuscado?.nome;
  const username = ehMeuProprioPerfil ? meuUsername : usuarioBuscado?.username;
  const fotoPerfil = ehMeuProprioPerfil ? minhaFoto : usuarioBuscado?.foto_perfil;
  const descricao = ehMeuProprioPerfil ? minhaDescricao : usuarioBuscado?.descricao;
  const frame = ehMeuProprioPerfil ? meuFrame : usuarioBuscado?.frame;

  const carregando = erroPerfil
    ? false
    : (ehMeuProprioPerfil ? authLoading && meuNome == null : !usuarioBuscado);

  const caminhoFrame = getFrameImagePath(frame);
  const usuarioModalId = idAlvo ?? (meuId != null ? Number(meuId) : 0);
  const usuarioLogadoId = meuId != null ? Number(meuId) : 0;

  // Definição correta de privacidade unificando Meu Perfil vs Outro Usuário
  const esconderSeguidores = !ehMeuProprioPerfil && (usuarioBuscado?.hide_followers ?? false);
  const esconderSeguindo = !ehMeuProprioPerfil && (usuarioBuscado?.hide_following ?? false);

  const hideFavFinal = ehMeuProprioPerfil ? false : (usuarioBuscado?.hide_favorite_character ?? false);
  const hideRecFinal = ehMeuProprioPerfil ? false : (usuarioBuscado?.hide_recent_character ?? false);
  const xpNecessario = nivelUsuario != null ? (nivelUsuario < 10 ? 200 + (nivelUsuario - 1) * 100 : 1000) : 200;

  // Progresso do anel de XP ao redor do avatar
  const xpPercent = xpNecessario > 0
    ? Math.min(100, Math.max(0, ((xpUsuario ?? 0) / xpNecessario) * 100))
    : 0;
  const ringOffset = RING_CIRCUMFERENCE - (xpPercent / 100) * RING_CIRCUMFERENCE;

  return (
    <main className={styles.containerPerfil}>
      <section className={styles.hero}>
        {erroPerfil ? (
          <div>Não foi possível carregar este perfil.</div>
        ) : carregando ? (
          <div className={styles.heroCard} aria-busy="true" aria-label="Carregando perfil">
            <div className={styles.profileHeader}>
              <div className={`${styles.avatarWrapper} ${styles.skeleton} ${styles.skeletonAvatar}`} />

              <div className={styles.profileIdentity}>
                <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonName}`} />
                <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonUsername}`} />
              </div>
            </div>

            <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonDescLong}`} />
            <div className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonDescShort}`} />

            <div className={styles.skeletonStats}>
              <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
              <div className={`${styles.skeleton} ${styles.skeletonStat}`} />
            </div>

            <div className={`${styles.skeleton} ${styles.skeletonButton}`} />
          </div>
        ) : (
          <div className={styles.heroCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                <svg className={styles.xpRing} viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                    className={styles.xpRingTrack}
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                  />
                  <circle
                    className={styles.xpRingFill}
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    style={{
                      strokeDasharray: RING_CIRCUMFERENCE,
                      strokeDashoffset: ringOffset,
                    }}
                  />
                </svg>

                <Image
                  src={fotoPerfil || '/image/semPerfil.jpg'}
                  alt={nome || 'Foto de perfil'}
                  className={styles.avatar}
                  width={120}
                  height={120}
                  priority
                  style={{ objectFit: 'cover' }}
                />
                {caminhoFrame && (
                  <Image
                    src={caminhoFrame}
                    alt="Frame"
                    className={styles.frame}
                    width={128}
                    height={128}
                    priority
                  />
                )}

                <span
                  className={styles.levelChip}
                  title={`Nível ${nivelUsuario ?? 1}`}
                  aria-label={`Nível ${nivelUsuario ?? 1}`}
                >
                  {carregandoNivel ? '…' : nivelUsuario ?? 1}
                </span>
              </div>

              <div className={styles.profileIdentity}>
                <h1 className={styles.nome}>{nome}</h1>
                {username && <p className={styles.username}>@{username}</p>}
                {ehMeuProprioPerfil && (
                  <p className={styles.xpText}>
                    {carregandoNivel ? 'Carregando…' : `${xpUsuario ?? 0} / ${xpNecessario} XP para o próximo nível`}
                  </p>
                )}
              </div>
            </div>

            {descricao && descricao.trim() !== '' ? (
              <p className={styles.descricao}>{descricao}</p>
            ) : (
              !ehMeuProprioPerfil && <p className={styles.descricao}>{nome} ainda não tem descrição</p>
            )}

            <div className={styles.statsInline}>
              <button
                className={styles.statItem}
                onClick={() => !esconderSeguidores && setAbrirSeguidores(true)}
                type="button"
                disabled={esconderSeguidores}
              >
                <FiUsers size={14} className={styles.statIcon} />
                <span className={styles.statNumber}>{esconderSeguidores ? '—' : seguidores.length}</span>
                <span className={styles.statLabel}>Seguidores</span>
              </button>

              <button
                className={styles.statItem}
                onClick={() => !esconderSeguindo && setAbrirSeguindo(true)}
                type="button"
                disabled={esconderSeguindo}
              >
                <FiUserPlus size={14} className={styles.statIcon} />
                <span className={styles.statNumber}>{esconderSeguindo ? '—' : seguindo.length}</span>
                <span className={styles.statLabel}>Seguindo</span>
              </button>
            </div>

            {!ehMeuProprioPerfil && (
              <button
                onClick={seguirUsuario}
                type="button"
                className={estaSeguindo ? styles.btnDeixarSeguir : styles.btnSeguir}
              >
                {estaSeguindo ? <FiUserCheck size={14} /> : <FiUserPlus size={14} />}
                {estaSeguindo ? 'Deixar de seguir' : 'Seguir'}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="w-full">
        <TapsProfile
          usuarioId={idAlvo ?? Number(meuId)}
          hideFavoriteCharacter={hideFavFinal}
          hideRecentCharacter={hideRecFinal}
        />
      </section>

      {abrirSeguidores && (
        <ModalSeguidores
          tipo="seguidores"
          lista={esconderSeguidores ? [] : seguidores}
          onClose={() => setAbrirSeguidores(false)}
          usuario={usuarioModalId}
          usuarioLogado={usuarioLogadoId}
          oculto={esconderSeguidores}
        />
      )}
      {abrirSeguindo && (
        <ModalSeguidores
          tipo="seguindo"
          lista={esconderSeguindo ? [] : seguindo}
          onClose={() => setAbrirSeguindo(false)}
          usuario={usuarioModalId}
          usuarioLogado={usuarioLogadoId}
          oculto={esconderSeguindo}
        />
      )}
    </main>
  );
}

export default Profile;