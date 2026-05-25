import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext/AuthContext";
import { useFavorites } from "../../hooks/FavoritesContext/FavoritesContext";
import { useMeusPersonagens } from "../../hooks/UserPerson/UserPerson";
import styles from "./CardCharacterUser.module.css"

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

function CardCharacterUser() {
  const { usuarioId, token } = useAuth();
  const { adicionarFavorito, removerFavorito } = useFavorites();
  const navigate = useNavigate();

  const { personagens, like, favorito } =
    useMeusPersonagens(usuarioId, token || '');

  const handleFavorito = (p: Personagem) => {
    if (p.favoritadoPeloUsuario) {
      removerFavorito(p.id);
    } else {
      adicionarFavorito({
        id: p.id,
        nome: p.nome,
        fotoia: p.fotoia || '/image/semPerfil.jpg'
      });
    }
    // Notificar que os favoritos foram atualizados
    localStorage.setItem('favoritos_updated', Date.now().toString());
    favorito(p.id);
  };

  return (
    <section className={styles.cardsPersonagens}>
      {personagens.length > 0 ? (
        personagens.map((p: Personagem) => (
          <article key={p.id} className={styles.meusPersonagens}>
            
            {/* Botão Editar */}
            <button
              className={styles.btnEditar}
              onClick={() => {
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

            <div className={styles.cardHeader}>
              <img
                src={p.fotoia || "/image/semPerfil.jpg"}
                alt={p.nome}
                className={styles.cardImg}
              />
              <h3 className={styles.cardTitle}>{p.nome}</h3>
            </div>

            <p className={styles.cardDescription}>
              {p.bio || "Sem bio para este personagem."}
            </p>

            {/* Interações */}
            <div className={styles.interactions}>
              
              {/* Like */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  like(p.id);
                }}
                className={`${styles.likeButton} ${
                  p.curtidoPeloUsuario ? styles.active : ""
                }`}
              >
                <span>{p.likes ?? 0}</span>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill={p.curtidoPeloUsuario ? "#ff4b4b" : "none"}
                  stroke={p.curtidoPeloUsuario ? "#ff4b4b" : "currentColor"}
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

            {/* Botão Conversar */}
            <div className={styles.btnConversarContainer}>
              <button
                className={styles.btnConversar}
                onClick={() =>
                  navigate(`/personagem/${p.id}`, {
                    state: { personagem: p }
                  })
                }
              >
                <i className="fa-solid fa-comment-dots"></i>
                Conversar
              </button>
            </div>
          </article>
        ))
      ) : (
        <div className={styles.semPersonagens}>
          <i
            className={`fa-regular fa-face-sad-tear ${styles.iconSemPersonagens}`}
          ></i>
          <p className={styles.textSemPersonagens}>
            Você ainda não criou nenhum personagem.
          </p>
        </div>
      )}
    </section>
  );
}

export default CardCharacterUser;
