'use client'; // Necessário no Next.js (App Router) devido ao uso de hooks, efeitos de ciclo de vida e requisições no cliente

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './Profile.module.css';
import { useAuth } from '../../../hooks/AuthContext/AuthContext';
import { useSeguir } from '../../../hooks/useSocial/useSocial';
import ModalSeguidores from '../ModalSeguidores/ModalSeguidores';
import TapsProfile from '../TapsProfile/TapsProfile';
import { API_URL } from '../../../config/api';
import { FRAME_UPDATED_EVENT, normalizeFrame, type FrameUpdatedDetail } from '../../../utils/frame';

interface UsuarioAlvo {
  nome: string;
  username?: string | null;
  foto_perfil: string;
  descricao: string;
  frame?: string | null;
}

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
  } = useAuth();

  // Se não veio id na rota, ou o id é o meu próprio, é o meu perfil
  const ehMeuProprioPerfil = !idDaRota
    || idDaRota === String(meuId)
    || idDaRota.toLowerCase() === meuUsername?.toLowerCase();
  const [idAlvo, setIdAlvo] = useState<number | null>(meuId ? Number(meuId) : null);

  // Dados de outro usuário (só usados quando não é o meu próprio perfil)
  const [usuarioBuscado, setUsuarioBuscado] = useState<UsuarioAlvo | null>(null);
  const [estaSeguindo, setEstaSeguindo] = useState<boolean>(false);
  const [erroPerfil, setErroPerfil] = useState<boolean>(false);

  const [abrirSeguidores, setAbrirSeguidores] = useState(false);
  const [abrirSeguindo, setAbrirSeguindo] = useState(false);

  const { seguidores, seguindo } = useSeguir(idAlvo, token);

  // Busca os dados quando for perfil de outro usuário
  useEffect(() => {
    if (ehMeuProprioPerfil) {
      setIdAlvo(meuId ? Number(meuId) : null);
      setUsuarioBuscado(null);
      setEstaSeguindo(false);
      setErroPerfil(false);
      return;
    }

    if (!idDaRota) return;

    // Evita que uma resposta "atrasada" de uma rota anterior sobrescreva
    // os dados da rota atual (ex: usuário navega rápido entre perfis).
    let cancelado = false;
    setErroPerfil(false);

    const fetchData = async () => {
      try {
        const perfilRes = await axios.get(`${API_URL}/users/other-user/${encodeURIComponent(idDaRota)}`);
        const perfil = perfilRes.data;
        if (cancelado) return;

        setUsuarioBuscado(perfil);
        setIdAlvo(Number(perfil.id));

        if (perfil.username && idDaRota.toLowerCase() !== perfil.username.toLowerCase()) {
          const rotaAtual = window.location.pathname;
          const rotaEsperada = `/profile/${perfil.username}`;
          if (rotaAtual !== rotaEsperada) {
            router.replace(rotaEsperada);
          }
        }

        const seguidoresRes = await axios.get(`${API_URL}/social/users/${perfil.id}/followers`);
        if (cancelado) return;

        const jaSegue = seguidoresRes.data?.some((s: { id: number }) => s.id === Number(meuId));
        setEstaSeguindo(jaSegue || false);
      } catch (error) {
        if (cancelado) return;
        console.error('Erro ao carregar dados do perfil:', error);
        setErroPerfil(true);
      }
    };
    fetchData();

    return () => {
      cancelado = true;
    };
  }, [ehMeuProprioPerfil, idDaRota, meuId, router]);

  // Escuta atualização de frame em tempo real (relevante sobretudo para o perfil de outros)
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

  // Unifica os dados exibidos, vindo do contexto (meu perfil) ou do fetch (perfil de outro)
  const nome = ehMeuProprioPerfil ? meuNome : usuarioBuscado?.nome;
  const username = ehMeuProprioPerfil ? meuUsername : usuarioBuscado?.username;
  const fotoPerfil = ehMeuProprioPerfil ? minhaFoto : usuarioBuscado?.foto_perfil;
  const descricao = ehMeuProprioPerfil ? minhaDescricao : usuarioBuscado?.descricao;
  const frame = ehMeuProprioPerfil ? meuFrame : usuarioBuscado?.frame;

  // Considera "carregando" tanto o caso de perfil de terceiros ainda não buscado
  // quanto o caso do próprio perfil enquanto o AuthContext ainda não populou o nome.
  // Ajuste "meuNome == null" se o seu useAuth usar outra convenção para "ainda carregando".
  const carregando = erroPerfil
    ? false
    : (ehMeuProprioPerfil ? meuNome == null : !usuarioBuscado);

  const frameAtivo = normalizeFrame(frame);
  const caminhoFrame = frameAtivo ? `/image/frames/${frameAtivo}` : null;
  const usuarioModalId = idAlvo ?? (meuId != null ? Number(meuId) : 0);
  const usuarioLogadoId = meuId != null ? Number(meuId) : 0;

  return (
    <main className={styles.containerPerfil}>
      <section className={styles.hero}>
        {erroPerfil ? (
          <div>Não foi possível carregar este perfil.</div>
        ) : carregando ? (
          <div>carregando..</div>
        ) : (
          <>
            {/* AVATAR + FRAME */}
            <div className={styles.avatarWrapper} style={{ position: 'relative' }}>
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
            </div>

            {/* NOME */}
            <h1 className={styles.nome}>{nome}</h1>
            {username && <p className={styles.username}>@{username}</p>}

            {/* DESCRIÇÃO */}
            {descricao && descricao.trim() !== '' ? (
              <p className={styles.descricao}>{descricao}</p>
            ) : (
              !ehMeuProprioPerfil && <p className={styles.descricao}>{nome} ainda não tem descrição</p>
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

            {/* BOTÃO SEGUIR — só aparece no perfil de outro usuário */}
            {!ehMeuProprioPerfil && (
              <button
                onClick={seguirUsuario}
                type="button"
                className={estaSeguindo ? styles.btnDeixarSeguir : styles.btnSeguir}
              >
                {estaSeguindo ? 'Deixar de seguir' : 'Seguir'}
              </button>
            )}
          </>
        )}
      </section>

      <section className="w-full">
        <TapsProfile usuarioId={idAlvo ?? Number(meuId)} />
      </section>

      {abrirSeguidores && (
        <ModalSeguidores
          tipo="seguidores"
          lista={seguidores}
          onClose={() => setAbrirSeguidores(false)}
          usuario={usuarioModalId}
          usuarioLogado={usuarioLogadoId}
        />
      )}
      {abrirSeguindo && (
        <ModalSeguidores
          tipo="seguindo"
          lista={seguindo}
          onClose={() => setAbrirSeguindo(false)}
          usuario={usuarioModalId}
          usuarioLogado={usuarioLogadoId}
        />
      )}
    </main>
  );
}

export default Profile;