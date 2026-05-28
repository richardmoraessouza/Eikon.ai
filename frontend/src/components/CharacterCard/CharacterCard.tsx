import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext/AuthContext";
import { useMeusPersonagens } from "../../hooks/UserPerson/UserPerson";
import { toggleFavorito, toggleLike, buscarFavoritosUsuario, buscarPersonagensRecentes,  buscarQuantidadeLikes, buscarLikesUsuario } from "../../services/personagemService";
import styles from "./CharacterCard.module.css"
import { useState, useEffect } from "react";

interface Personagem {
  id: number;
  nome: string;
  fotoia?: string;
  bio?: string;
  descricao?: string;
  likes?: number;
  criador?: string;
  usuario_id: number;
  tipo_personagem: string;
  curtidoPeloUsuario?: boolean;
  favoritadoPeloUsuario?: boolean;
}

interface CharacterCardProps {
  type: "meus-personagens" | "favoritos" | "recentes";
  abaAtiva?: string;
  usuarioId?: number | null;
}

function CharacterCard({ type, abaAtiva, usuarioId: externalUsuarioId }: CharacterCardProps) {
  const { usuarioId: loggedUsuarioId, token } = useAuth();
  const navigate = useNavigate();
  const usuarioIdFinal = externalUsuarioId !== undefined ? externalUsuarioId : loggedUsuarioId;
  const { personagens } = useMeusPersonagens(usuarioIdFinal, token || '');
  
  const [favoritos, setFavoritos] = useState<Personagem[]>([]);
  const [recentes, setRecentes] = useState<Personagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [curtidas, setCurtidas] = useState<{ [key: number]: boolean }>({});
  const [likes, setLikes] = useState<{ [key: number]: number }>({});
  const [personagensLocal, setPersonagensLocal] = useState<Personagem[]>([]);

  // Sincronizar dados de meus-personagens
  useEffect(() => {
    if (type === "meus-personagens" && personagens.length > 0 && usuarioIdFinal) {
      // Enriquecer com informação de favoritos
      const enriquecerComFavoritos = async () => {
        try {
          if (!usuarioIdFinal) return;
          const favData = await buscarFavoritosUsuario(usuarioIdFinal);
          const favoritosSet = new Set(
            (Array.isArray(favData) ? favData : []).map(item => 
              typeof item === 'number' ? item : item.id
            )
          );
          
          const personagensEnriquecidos = personagens.map(p => ({
            ...p,
            favoritadoPeloUsuario: favoritosSet.has(p.id)
          }));
          
          setPersonagensLocal(personagensEnriquecidos);
          
          // Sincronizar curtidas e likes
          const novasCurtidas: { [key: number]: boolean } = {};
          const novosLikes: { [key: number]: number } = {};
          
          personagensEnriquecidos.forEach(p => {
            novasCurtidas[p.id] = p?.curtidoPeloUsuario || false;
            novosLikes[p.id] = p?.likes || 0;
          });
          
          setCurtidas(novasCurtidas);
          setLikes(novosLikes);
        } catch (err) {
          console.error("Erro ao enriquecer personagens:", err);
          setPersonagensLocal(personagens);
        }
      };
      
      enriquecerComFavoritos();
    }
  }, [personagens, type, usuarioIdFinal]);

  // Helper para enriquecer dados com likes e favoritos
  const enriquecerComLikes = async (personagens: Personagem[], usuarioId: number, isFavoritos: boolean = false) => {
    try {
      // Buscar likes do usuário (com autenticação se disponível)
      const likesUsuario = token ? await buscarLikesUsuario(usuarioId, token) : [];
      const likesSet = new Set(likesUsuario);
      
      // Se é favoritos, buscar todos os favoritos para marcar
      let favoritosSet = new Set<number>();
      if (!isFavoritos) {
        const favData = await buscarFavoritosUsuario(usuarioId);
        favoritosSet = new Set(
          (Array.isArray(favData) ? favData : []).map(item => 
            typeof item === 'number' ? item : item.id
          )
        );
      }
      
      // Buscar quantidade de likes para cada personagem
      const personagensEnriquecidos = await Promise.all(
        personagens.map(async (p) => {
          const quantidade = await buscarQuantidadeLikes(p.id);
          return {
            ...p,
            likes: quantidade,
            curtidoPeloUsuario: likesSet.has(p.id),
            favoritadoPeloUsuario: isFavoritos ? true : favoritosSet.has(p.id)
          };
        })
      );
      
      return personagensEnriquecidos;
    } catch (err) {
      console.error("Erro ao enriquecer dados:", err);
      return personagens;
    }
  };

  // Carregar favoritos
  useEffect(() => {
    if (type === "favoritos" && usuarioIdFinal) {
      setLoading(true);
      buscarFavoritosUsuario(usuarioIdFinal)
        .then(async (data) => {
          const favData = Array.isArray(data) ? data : [];
          // Enriquecer com dados de likes, todos são favoritos
          const enriquecido = await enriquecerComLikes(favData, usuarioIdFinal, true);
          setFavoritos(enriquecido);
          
          // Sincronizar curtidas
          const novasCurtidas: { [key: number]: boolean } = {};
          const novosLikes: { [key: number]: number } = {};
          
          enriquecido.forEach(p => {
            if (p?.id) {
              novasCurtidas[p.id] = p?.curtidoPeloUsuario || false;
              novosLikes[p.id] = p?.likes || 0;
            }
          });
          
          setCurtidas(novasCurtidas);
          setLikes(novosLikes);
        })
        .catch((err) => {
          console.error("Erro ao carregar favoritos:", err);
          setFavoritos([]);
        })
        .finally(() => setLoading(false));
    }
  }, [type, usuarioIdFinal, abaAtiva]);

  // Carregar recentes
  useEffect(() => {
    if (type === "recentes" && usuarioIdFinal) {
      setLoading(true);
      buscarPersonagensRecentes(usuarioIdFinal)
        .then(async (data) => {
          const recentesData = Array.isArray(data) ? data : [];
          // Enriquecer com dados de likes
          const enriquecido = await enriquecerComLikes(recentesData, usuarioIdFinal);
          setRecentes(enriquecido);
          
          // Sincronizar curtidas
          const novasCurtidas: { [key: number]: boolean } = {};
          const novosLikes: { [key: number]: number } = {};
          
          enriquecido.forEach(p => {
            if (p?.id) {
              novasCurtidas[p.id] = p?.curtidoPeloUsuario || false;
              novosLikes[p.id] = p?.likes || 0;
            }
          });
          
          setCurtidas(novasCurtidas);
          setLikes(novosLikes);
        })
        .catch((err) => {
          console.error("Erro ao carregar recentes:", err);
          setRecentes([]);
        })
        .finally(() => setLoading(false));
    }
  }, [type, usuarioIdFinal, abaAtiva]);

  // Listener para mudanças de favoritos (funciona para todos os tipos)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'favoritos_updated' && usuarioIdFinal) {
        setTimeout(() => {
          if (type === "favoritos") {
            buscarFavoritosUsuario(usuarioIdFinal)
              .then((data) => setFavoritos(Array.isArray(data) ? data : []))
              .catch((err) => console.error("Erro ao recarregar favoritos:", err));
          }
        }, 300);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [usuarioIdFinal, type]);

  const handleFavorito = async (p: Personagem) => {
    if (!loggedUsuarioId || !token || token.trim() === '') {
      navigate('/entrar');
      return;
    }
    
    try {
      await toggleFavorito(loggedUsuarioId, p.id, token);
      localStorage.setItem('favoritos_updated', Date.now().toString());
      
      // Atualizar estado local do favorito
      const novoFavorito = !p.favoritadoPeloUsuario;
      
      if (type === "meus-personagens") {
        // Atualizar dados locais
        setPersonagensLocal(prev => 
          prev.map(item => 
            item.id === p.id 
              ? { ...item, favoritadoPeloUsuario: novoFavorito }
              : item
          )
        );
      } else if (type === "favoritos") {
        // Se está removendo favorito, remove da lista
        if (p.favoritadoPeloUsuario) {
          setFavoritos(prev => prev.filter(item => item.id !== p.id));
        }
      } else if (type === "recentes") {
        // Atualizar o estado local para recentes também
        setRecentes(prev =>
          prev.map(item =>
            item.id === p.id
              ? { ...item, favoritadoPeloUsuario: novoFavorito }
              : item
          )
        );
      }
    } catch (err: any) {
      console.error("Erro ao alternar favorito:", err);
      if (err?.response?.status === 401) {
        navigate('/entrar');
      }
    }
  };

  const handleLike = async (personagemId: number) => {
    // 🔒 SEGURANÇA: Sempre usar loggedUsuarioId, nunca usuarioIdFinal!
    if (!loggedUsuarioId || !token || token.trim() === '') {
      navigate('/entrar');
      return;
    }

    const jaCurtido = curtidas[personagemId];
    
    // Atualizar UI otimista
    setCurtidas(prev => ({
      ...prev,
      [personagemId]: !jaCurtido
    }));
    
    setLikes(prev => ({
      ...prev,
      [personagemId]: jaCurtido ? (prev[personagemId] || 0) - 1 : (prev[personagemId] || 0) + 1
    }));

    try {
      // ✅ CORRIGIDO: Usar loggedUsuarioId (usuário autenticado), não usuarioIdFinal!
      await toggleLike(loggedUsuarioId, personagemId, token);
    } catch (err: any) {
      console.error('Erro ao dar like:', err);
      // Reverter estado em caso de erro
      setCurtidas(prev => ({
        ...prev,
        [personagemId]: jaCurtido
      }));
      setLikes(prev => ({
        ...prev,
        [personagemId]: jaCurtido ? (prev[personagemId] || 0) + 1 : (prev[personagemId] || 0) - 1
      }));
      if (err?.response?.status === 401) {
        navigate('/entrar');
      }
    }
  };

  if (loading) {
    return (
      <article className="flex justify-center p-4">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </article>
    );
  }

  // Escolher qual array de dados renderizar baseado no tipo
  let dataToRender: Personagem[] = [];
  let emptyMessage = "";

  if (type === "meus-personagens") {
    dataToRender = personagensLocal;
    emptyMessage = "Você ainda não criou nenhum personagem.";
  } else if (type === "favoritos") {
    dataToRender = favoritos;
    emptyMessage = "Nenhum personagem favoritado.";
  } else if (type === "recentes") {
    dataToRender = recentes;
    emptyMessage = "Nenhum personagem visualizado recentemente.";
  }

  if (dataToRender.length === 0) {
    return (
      <article className={`flex flex-col items-center gap-3 w-full ${styles.textSemPersonagens}`}>
        <span>
          <i className={`fa-regular fa-face-sad-tear ${styles.iconSemPersonagens}`}></i>
        </span>
        <p>{emptyMessage}</p>
      </article>
    );
  }

  return (
    <article className={`${styles.cardsPersonagens} grid grid-cols-1 gap-3 p-2 w-4/6`}>
      {dataToRender.map((p: Personagem) => (
        <div 
          key={p.id} 
          className={`flex items-center gap-3 p-3 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors cursor-pointer ${styles.character}`}
          onClick={() => window.location.href = `/personagem/${p.id}`}
        >
          {/* Botão Editar - Apenas para meus-personagens E se for o usuário logado */}
          {type === "meus-personagens" && usuarioIdFinal === loggedUsuarioId && (
            <button
              className={styles.btnEditar}
              onClick={(e) => {
                e.stopPropagation();
                const rota =
                  p.tipo_personagem === "person"
                    ? "/criacao-person"
                    : "/person-ficticio";

                navigate(rota, {
                  state: { editar: true, personagem: p }
                });
              }}
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          )}

          {/* Imagem */}
          <div>
            <img
              src={p.fotoia || "/image/semPerfil.jpg"}
              alt={p.nome}
              className={`${styles.cardImg}`}
            />
          </div>

          {/* Conteúdo */}
          <div className={`flex flex-col`}>
            <h3 className={styles.cardTitle}>{p.nome}</h3>
            <p className={styles.cardBio}>
              {p.bio || "Sem bio para este personagem."}
            </p>

            {/* Interações */}
            <div className={styles.interactions}>
              {/* Like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(p.id);
                }}
                className={`${styles.likeButton} ${
                  curtidas[p.id] ? styles.active : ""
                }`}
              >
                <span>{likes[p.id] ?? 0}</span>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill={curtidas[p.id] ? "#ff4b4b" : "none"}
                  stroke={curtidas[p.id] ? "#ff4b4b" : "currentColor"}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              {/* Comentário */}
              <button
                className={styles.commentButton}
                onClick={(e) => e.stopPropagation()}
              >
                <span>0</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 5v-5a3 3 0 0 1-3-3V5z"/>
                  <line x1="8" y1="8" x2="16" y2="8"/>
                  <line x1="8" y1="12" x2="13" y2="12"/>
                </svg> 
              </button>

              {/* Favorito */}
              <button
                className={styles.favorito}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorito(p);
                }}
              >
                <i
                  className={`fa ${
                    p.favoritadoPeloUsuario
                      ? "fa-solid fa-star"
                      : "fa-regular fa-star"
                  }`}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    color: p.favoritadoPeloUsuario
                      ? "#FFD700"
                      : "#888"
                  }}
                ></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </article>
  );
}

export default CharacterCard;
