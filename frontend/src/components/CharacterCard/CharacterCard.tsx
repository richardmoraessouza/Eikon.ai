import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext/AuthContext";
import { useMeusPersonagens } from "../../hooks/UserPerson/UserPerson";
import { toggleFavorito, toggleLike, buscarFavoritosUsuario, buscarPersonagensRecentes,  buscarQuantidadeLikes, buscarLikesUsuario } from "../../services/personagemService";
import styles from "./CharacterCard.module.css"
import { useState, useEffect } from "react";

// ============================================================
// 📋 INTERFACE: Personagem
// ============================================================
// Define a estrutura de um personagem que será exibido no card
// Contém dados básicos (nome, foto, bio) e dados de interação (likes, favoritos)
interface Personagem {
  id: number;                      // ID único do personagem
  nome: string;                    // Nome do personagem
  fotoia?: string;                 // URL da imagem/foto
  bio?: string;                    // Pequena descrição (bio)
  descricao?: string;              // Descrição completa do personagem
  likes?: number;                  // Quantidade de curtidas que o personagem recebeu
  criador?: string;                // Nome de quem criou
  usuario_id: number;              // ID do usuário que criou este personagem
  tipo_personagem: string;         // Tipo: "person" ou "person-ficticio"
  curtidoPeloUsuario?: boolean;    // Se o usuário LOGADO curtiu este personagem
  favoritadoPeloUsuario?: boolean; // Se o usuário LOGADO favoritou este personagem
}

// ============================================================
// 📋 INTERFACE: CharacterCardProps
// ============================================================
// Define as props que o componente CharacterCard recebe do pai
interface CharacterCardProps {
  type: "meus-personagens" | "favoritos" | "recentes";  // Qual tipo de lista exibir
  abaAtiva?: string;                                     // Qual aba está ativa (trigger para recarregar dados)
  usuarioId?: number | null;                             // ID do usuário cujos dados queremos ver (pode ser outro usuário)
}

function CharacterCard({ type, abaAtiva, usuarioId: externalUsuarioId }: CharacterCardProps) {
  // ============================================================
  // 🎣 HOOKS PRINCIPAIS
  // ============================================================
  // Obtém o usuário logado e o token JWT para autenticação
  const { usuarioId: loggedUsuarioId, token } = useAuth();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Se externalUsuarioId foi passado (visualizando outro usuário), usa ele
  // Caso contrário, usa o ID do usuário logado
  // Isso permite visualizar dados de outros usuários mantendo segurança
  const usuarioIdFinal = externalUsuarioId !== undefined ? externalUsuarioId : loggedUsuarioId;
  
  // Busca personagens criados pelo usuário (já vem com dados básicos)
  const { personagens } = useMeusPersonagens(usuarioIdFinal, token || '');
  
  // ============================================================
  // 📦 ESTADOS (useState)
  // ============================================================
  // Array para armazenar personagens quando type="meus-personagens"
  const [personagensLocal, setPersonagensLocal] = useState<Personagem[]>([]);
  
  // Array para armazenar personagens favoritados quando type="favoritos"
  const [favoritos, setFavoritos] = useState<Personagem[]>([]);
  
  // Array para armazenar personagens visualizados recentemente quando type="recentes"
  const [recentes, setRecentes] = useState<Personagem[]>([]);
  
  // Controla se está carregando dados (para mostrar spinner)
  const [loading, setLoading] = useState(false);
  
  // Armazena qual personagem foi curtido pelo usuário logado
  // Chave: ID do personagem | Valor: true/false (curtiu ou não)
  const [curtidas, setCurtidas] = useState<{ [key: number]: boolean }>({});
  
  // Armazena a quantidade de curtidas para cada personagem
  // Chave: ID do personagem | Valor: número de curtidas
  const [likes, setLikes] = useState<{ [key: number]: number }>({});

  // ============================================================
  // 🎣 EFEITO 1: Sincronizar dados de "meus-personagens"
  // ============================================================
  // QUANDO executa: Quando type="meus-personagens" E há personagens para mostrar
  // O QUÊ faz: 
  //   1. Busca os favoritos do usuário no backend
  //   2. Marca cada personagem se foi favoritado ou não
  //   3. Sincroniza os estados locais de curtidas e likes
  // RESULTADO: personagensLocal fica pronto para renderizar com dados corretos
  useEffect(() => {
    if (type === "meus-personagens" && personagens.length > 0 && usuarioIdFinal) {
      // Função async interna para enriquecer dados
      const enriquecerComFavoritos = async () => {
        try {
          if (!usuarioIdFinal) return;
          
          // Busca os favoritos deste usuário (personagens que ele favoritou)
          const favData = await buscarFavoritosUsuario(usuarioIdFinal);
          
          // Converte o array de favoritos em um Set para busca rápida (O(1))
          // Alguns dados vêm como objeto {id: ...}, outros como número
          const favoritosSet = new Set(
            (Array.isArray(favData) ? favData : []).map(item => 
              typeof item === 'number' ? item : item.id
            )
          );
          
          // Percorre cada personagem e marca se foi favoritado
          const personagensEnriquecidos = personagens.map(p => ({
            ...p,
            favoritadoPeloUsuario: favoritosSet.has(p.id)
          }));
          
          // Salva os personagens enriquecidos no estado
          setPersonagensLocal(personagensEnriquecidos);
          
          // Cria objetos para armazenar curtidas e likes de forma otimizada
          const novasCurtidas: { [key: number]: boolean } = {};
          const novosLikes: { [key: number]: number } = {};
          
          // Preenche os objetos com dados de cada personagem
          personagensEnriquecidos.forEach(p => {
            novasCurtidas[p.id] = p?.curtidoPeloUsuario || false;
            novosLikes[p.id] = p?.likes || 0;
          });
          
          // Sincroniza os estados
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

  // ============================================================
  // 🛠️ FUNÇÃO AUXILIAR: enriquecerComLikes()
  // ============================================================
  // PROPÓSITO: Completar os dados dos personagens com info de likes e favoritos
  // 
  // PARÂMETROS:
  //   - personagens: array de personagens a enriquecer
  //   - usuarioId: ID do usuário cuja lista estamos vendo
  //   - isFavoritos: true se está na aba "favoritos", false caso contrário
  // 
  // RETORNA: Array de personagens com campos preenchidos:
  //   - curtidoPeloUsuario: se o usuário logado curtiu
  //   - favoritadoPeloUsuario: se o usuário logado favoritou
  //   - likes: quantidade total de curtidas
  const enriquecerComLikes = async (personagens: Personagem[], usuarioId: number, isFavoritos: boolean = false) => {
    try {
      // ========== PASSO 1: Buscar LIKES do usuário ==========
      // Busca quais personagens este usuário (usuarioId) curtiu
      // Passa o token para autenticação (se disponível)
      const likesUsuario = token ? await buscarLikesUsuario(usuarioId, token) : [];
      
      // Converte o array de likes em um Set para busca rápida O(1)
      // Exemplo: [1, 3, 5] → Set{1, 3, 5}
      const likesSet = new Set(likesUsuario);
      
      // ========== PASSO 2: Determinar FAVORITOS a exibir ==========
      // A lógica é diferente dependendo do contexto
      let favoritosSet = new Set<number>();
      
      if (isFavoritos && usuarioId === loggedUsuarioId) {
        // ✅ CASO 1: Vendo SEUS próprios favoritos
        // Todos os personagens nessa lista já são favoritos
        // Então marca todos como favoritados
        favoritosSet = new Set(personagens.map(p => p.id));
      } 
      else if (isFavoritos && usuarioId !== loggedUsuarioId) {
        // ✅ CASO 2: Vendo favoritos de OUTRO usuário
        // Não queremos saber os favoritos do outro usuário
        // Queremos saber NOSSOS favoritos (se favoritamos algum deles também)
        if (loggedUsuarioId && token) {
          const favData = await buscarFavoritosUsuario(loggedUsuarioId);
          favoritosSet = new Set(
            (Array.isArray(favData) ? favData : []).map(item => 
              typeof item === 'number' ? item : item.id
            )
          );
        }
      } 
      else if (!isFavoritos) {
        // ✅ CASO 3: Modo normal (não está na aba de favoritos)
        // Busca favoritos do usuário sendo visualizado
        const favData = await buscarFavoritosUsuario(usuarioId);
        favoritosSet = new Set(
          (Array.isArray(favData) ? favData : []).map(item => 
            typeof item === 'number' ? item : item.id
          )
        );
      }
      
      // ========== PASSO 3: Buscar quantidade de LIKES para cada personagem ==========
      // Faz requisição paralela para cada personagem
      // Retorna um novo array com os personagens enriquecidos
      const personagensEnriquecidos = await Promise.all(
        personagens.map(async (p) => {
          // Busca quantidade total de curtidas deste personagem
          const quantidade = await buscarQuantidadeLikes(p.id);
          
          return {
            ...p, // Spread: copia todos os dados anteriores
            likes: quantidade, // Total de curtidas deste personagem
            curtidoPeloUsuario: likesSet.has(p.id), // Usuário curtiu?
            favoritadoPeloUsuario: favoritosSet.has(p.id) // Usuário favoritou?
          };
        })
      );
      
      return personagensEnriquecidos;
    } catch (err) {
      console.error("Erro ao enriquecer dados:", err);
      // Se houver erro, retorna o array original sem enriquecimento
      return personagens;
    }
  };

  // ============================================================
  // 🎣 EFEITO 2: Carregar personagens favoritados
  // ============================================================
  // QUANDO executa: Quando type="favoritos"
  // O QUÊ faz:
  //   1. Busca os personagens favoritados pelo usuário (usuarioIdFinal)
  //   2. Enriquece com dados de likes
  //   3. Sincroniza os estados locais
  // RESULTADO: Array "favoritos" preenchido e pronto para renderizar
  useEffect(() => {
    if (type === "favoritos" && usuarioIdFinal) {
      setLoading(true);
      
      // Busca favoritos do usuário
      buscarFavoritosUsuario(usuarioIdFinal)
        .then(async (data) => {
          // Garante que é um array (às vezes pode vir vazio ou null)
          const favData = Array.isArray(data) ? data : [];
          
          // Enriquece com dados de likes e marcações de favoritos
          // isFavoritos=true indica que está vendo a aba de favoritos
          const enriquecido = await enriquecerComLikes(favData, usuarioIdFinal, true);
          
          // Salva no estado
          setFavoritos(enriquecido);
          
          // Sincroniza os mapeamentos de curtidas e likes locais
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
        .finally(() => setLoading(false)); // Para o spinner
    }
  }, [type, usuarioIdFinal, abaAtiva, loggedUsuarioId, token]);

  // ============================================================
  // 🎣 EFEITO 3: Carregar personagens visualizados recentemente
  // ============================================================
  // QUANDO executa: Quando type="recentes"
  // O QUÊ faz:
  //   1. Busca os personagens visualizados recentemente pelo usuário
  //   2. Enriquece com dados de likes
  //   3. Sincroniza os estados locais
  // RESULTADO: Array "recentes" preenchido e pronto para renderizar
  useEffect(() => {
    if (type === "recentes" && usuarioIdFinal) {
      setLoading(true);
      
      // Busca personagens visualizados recentemente
      buscarPersonagensRecentes(usuarioIdFinal)
        .then(async (data) => {
          // Garante que é um array
          const recentesData = Array.isArray(data) ? data : [];
          
          // Enriquece com dados de likes
          // isFavoritos=false porque estamos em modo normal (não é a aba de favoritos)
          const enriquecido = await enriquecerComLikes(recentesData, usuarioIdFinal);
          
          // Salva no estado
          setRecentes(enriquecido);
          
          // Sincroniza os mapeamentos de curtidas e likes locais
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
        .finally(() => setLoading(false)); // Para o spinner
    }
  }, [type, usuarioIdFinal, abaAtiva, loggedUsuarioId, token]);

  // ============================================================
  // 🎣 EFEITO 4: Escutar mudanças de favoritos (localStorage)
  // ============================================================
  // QUANDO executa: Montado/desmontado com o componente
  // O QUÊ faz:
  //   - Escuta eventos de storage (localStorage) para saber se favoritos mudaram
  //   - Se mudar, recarrega a lista de favoritos
  //   - Isso sincroniza dados entre abas/janelas do navegador
  // POR QUÊ: Quando favorita/desfavorita em um lugar, precisa atualizar em outros
  // RESULTADO: Dados sempre sincronizados mesmo se mudou em outra aba
  useEffect(() => {
    // Função que é chamada quando há mudança no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      // Verifica se a chave modificada é "favoritos_updated"
      // e se estamos visualizando algum usuário
      if (e.key === 'favoritos_updated' && usuarioIdFinal) {
        // setTimeout para dar tempo do backend processar a mudança
        setTimeout(() => {
          // Se estamos na aba de favoritos, recarrega a lista
          if (type === "favoritos") {
            buscarFavoritosUsuario(usuarioIdFinal)
              .then((data) => setFavoritos(Array.isArray(data) ? data : []))
              .catch((err) => console.error("Erro ao recarregar favoritos:", err));
          }
        }, 300); // Espera 300ms antes de recarregar
      }
    };

    // Registra o listener no objeto window
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup: Remove o listener quando componente desmontar
    // Isso evita memory leaks
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [usuarioIdFinal, type]);

  // ============================================================
  // 🎯 HANDLER: handleFavorito()
  // ============================================================
  // O QUÊ faz: Alterna o status de favorito de um personagem para o usuário logado
  // 
  // FLUXO:
  //   1. Valida se usuário está logado e tem token
  //   2. Envia requisição ao backend para alternar favorito
  //   3. Atualiza localStorage (trigger para recarregar em outros componentes)
  //   4. Atualiza o estado local dependendo do contexto
  //   5. Trata erros (401 redireciona para login)
  // 
  // COMPORTAMENTO ESPECIAL:
  //   - Se vendo SEUS favoritos: remove do array quando desfavoritar
  //   - Se vendo de OUTRO: apenas marca/desmarca, não remove
  //   - Em outras abas: apenas marca/desmarca
  const handleFavorito = async (p: Personagem) => {
    // ========== VALIDAÇÃO ==========
    // Verifica se usuário está autenticado
    if (!loggedUsuarioId || !token || token.trim() === '') {
      // Se não está logado, redireciona para página de login
      navigate('/entrar');
      return;
    }
    
    try {
      // ========== ENVIAR REQUISIÇÃO AO BACKEND ==========
      // 🔒 SEGURANÇA: Sempre usa loggedUsuarioId (JWT user), nunca usuarioIdFinal
      // O backend ignora URL parameters, confia apenas no JWT
      await toggleFavorito(loggedUsuarioId, p.id, token);
      
      // ========== NOTIFICAR OUTROS COMPONENTES ==========
      // Seta um marcador no localStorage para triggerar listeners em outros componentes
      localStorage.setItem('favoritos_updated', Date.now().toString());
      
      // ========== CALCULAR NOVO ESTADO ==========
      // Inverte o status: se era favorito, vira desfavoritado e vice-versa
      const novoFavorito = !p.favoritadoPeloUsuario;
      
      // ========== ATUALIZAR ESTADO LOCAL (dependente do contexto) ==========
      if (type === "meus-personagens") {
        // Modo "meus personagens": apenas marca/desmarca o personagem
        setPersonagensLocal(prev => 
          prev.map(item => 
            item.id === p.id 
              ? { ...item, favoritadoPeloUsuario: novoFavorito }
              : item
          )
        );
      } 
      else if (type === "favoritos" && usuarioIdFinal === loggedUsuarioId) {
        // Modo "favoritos SEUS": remove personagem da lista se desfavoritou
        // ✅ Só remove se ERA favorito (estava marcado como favoritadoPeloUsuario=true)
        if (p.favoritadoPeloUsuario) {
          setFavoritos(prev => prev.filter(item => item.id !== p.id));
        }
      } 
      else if (type === "favoritos") {
        // Modo "favoritos de OUTRO usuário": apenas marca/desmarca visualmente
        // ✅ NÃO remove da lista (não é nosso direito remover dos favoritos de outro)
        setFavoritos(prev =>
          prev.map(item =>
            item.id === p.id
              ? { ...item, favoritadoPeloUsuario: novoFavorito }
              : item
          )
        );
      } 
      else if (type === "recentes") {
        // Modo "recentes": apenas marca/desmarca o personagem
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
      
      // Se erro é 401 (não autenticado), redireciona para login
      if (err?.response?.status === 401) {
        navigate('/entrar');
      }
    }
  };

  // ============================================================
  // 🎯 HANDLER: handleLike()
  // ============================================================
  // O QUÊ faz: Alterna o status de like (curtida) de um personagem para o usuário logado
  // 
  // FLUXO:
  //   1. Valida se usuário está logado e tem token
  //   2. Atualiza UI IMEDIATAMENTE (otimistic update) - melhora UX
  //   3. Envia requisição ao backend
  //   4. Se erro: reverte a UI para o estado anterior
  //   5. Trata erros (401 redireciona para login)
  // 
  // SEGURANÇA: ✅ Sempre usa loggedUsuarioId, NUNCA usuarioIdFinal
  //           ✅ Backend rejeita se JWT for inválido
  const handleLike = async (personagemId: number) => {
    // ========== VALIDAÇÃO ==========
    // Verifica se usuário está autenticado
    if (!loggedUsuarioId || !token || token.trim() === '') {
      // Se não está logado, redireciona para página de login
      navigate('/entrar');
      return;
    }

    // ========== GUARDAR ESTADO ANTERIOR ==========
    // Pega o estado atual de curtida antes de alterar
    // Usamos isso para reverter se houver erro
    const jaCurtido = curtidas[personagemId];
    
    // ========== ATUALIZAÇÃO OTIMISTA (UI imediata) ==========
    // Altera a UI IMEDIATAMENTE sem esperar o backend
    // Isso faz a app parecer mais responsiva
    // Se der erro, revertemos depois
    
    // Inverte o status de curtida
    setCurtidas(prev => ({
      ...prev,
      [personagemId]: !jaCurtido
    }));
    
    // Incrementa ou decrementa a quantidade de likes
    setLikes(prev => ({
      ...prev,
      [personagemId]: jaCurtido 
        ? (prev[personagemId] || 0) - 1  // Se já curtiu, diminui
        : (prev[personagemId] || 0) + 1  // Se não curtiu, aumenta
    }));

    try {
      // ========== ENVIAR REQUISIÇÃO AO BACKEND ==========
      // 🔒 SEGURANÇA: Usar loggedUsuarioId (JWT user), NUNCA usuarioIdFinal
      // O backend extrai o usuário do JWT, ignora URL parameters
      await toggleLike(loggedUsuarioId, personagemId, token);
      
      // Se chegou aqui, o backend confirmou - UI está correta
    } catch (err: any) {
      console.error('Erro ao dar like:', err);
      
      // ========== REVERTER ESTADO EM CASO DE ERRO ==========
      // Se o backend rejeitou, voltar ao estado anterior
      
      // Reverte o status de curtida
      setCurtidas(prev => ({
        ...prev,
        [personagemId]: jaCurtido
      }));
      
      // Reverte a quantidade de likes
      setLikes(prev => ({
        ...prev,
        [personagemId]: jaCurtido 
          ? (prev[personagemId] || 0) + 1  // Se era, volta a ser
          : (prev[personagemId] || 0) - 1  // Se não era, volta a não ser
      }));
      
      // Se erro é 401 (token inválido), redireciona para login
      if (err?.response?.status === 401) {
        navigate('/entrar');
      }
    }
  };

  // ============================================================
  // 🎨 RENDERIZAÇÃO - Parte 1: Estados de Carregamento e Vazio
  // ============================================================
  
  // ESTADO 1: Carregando dados
  // Mostra spinner enquanto dados não chegaram do backend
  if (loading) {
    return (
      <article className="flex justify-center p-4">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </article>
    );
  }

  // ========== ESCOLHER QUAL ARRAY RENDERIZAR ==========
  // Dependendo do tipo (props), usa um array diferente
  let dataToRender: Personagem[] = [];
  let emptyMessage = "";

  if (type === "meus-personagens") {
    // Se é "meus-personagens", renderiza personagensLocal
    dataToRender = personagensLocal;
    emptyMessage = "Você ainda não criou nenhum personagem.";
  } else if (type === "favoritos") {
    // Se é "favoritos", renderiza o array de favoritos
    dataToRender = favoritos;
    emptyMessage = "Nenhum personagem favoritado.";
  } else if (type === "recentes") {
    // Se é "recentes", renderiza o array de recentes
    dataToRender = recentes;
    emptyMessage = "Nenhum personagem visualizado recentemente.";
  }

  // ESTADO 2: Nenhum dado para exibir
  // Se o array está vazio, mostra mensagem customizada
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

  // ============================================================
  // 🎨 RENDERIZAÇÃO - Parte 2: Grid de Cards
  // ============================================================
  // Se chegou aqui, há dados para renderizar
  
  return (
    <article className={`${styles.cardsPersonagens} grid grid-cols-1 gap-3 p-2 w-4/6`}>
      {/* Mapeia cada personagem para um card */}
      {dataToRender.map((p: Personagem) => (
        <div 
          key={p.id} 
          className={`flex items-center gap-3 p-3 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] transition-colors cursor-pointer ${styles.character}`}
          onClick={(e) => {
            // ========== LÓGICA DE NAVEGAÇÃO ==========
            // Cliques em botões/imagens não devem navegar para a página do personagem
            // Apenas cliques no espaço vazio do card navegam
            
            // Verifica se clicou em um botão
            const isButton = (e.target as HTMLElement).closest('button');
            
            // Verifica se clicou em uma imagem
            const isImg = (e.target as HTMLElement).closest('img');
            
            // Se NÃO clicou em botão e NÃO clicou em imagem, navega
            if (!isButton && !isImg) {
              window.location.href = `/personagem/${p.id}`;
            }
          }}
        >
          {/* ========== BOTÃO EDITAR ========== */}
          {/* Aparece APENAS se:
              1. type = "meus-personagens" (só em sua própria lista)
              2. usuarioIdFinal === loggedUsuarioId (é o próprio usuário)
          */}
          {type === "meus-personagens" && usuarioIdFinal === loggedUsuarioId && (
            <button
              className={styles.btnEditar}
              onClick={(e) => {
                // Previne que o clique suba para o pai (que navegaria)
                e.stopPropagation();
                
                // Determina a rota baseado no tipo de personagem
                const rota =
                  p.tipo_personagem === "person"
                    ? "/criacao-person"      // Person criados por usuário
                    : "/person-ficticio";    // Personagens fictícios criados por usuário

                // Navega passando o personagem para edição
                navigate(rota, {
                  state: { editar: true, personagem: p }
                });
              }}
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          )}

          {/* ========== IMAGEM DO PERSONAGEM ========== */}
          {/* Exibe a foto do personagem ou uma imagem padrão se não houver */}
          <div>
            <img
              src={p.fotoia || "/image/semPerfil.jpg"}  // Fallback para imagem padrão
              alt={p.nome}
              className={`${styles.cardImg}`}
            />
          </div>

          {/* ========== CONTEÚDO DO CARD ========== */}
          {/* Contém nome, bio e botões de interação */}
          <div className={`flex flex-col`}>
            {/* Nome do personagem */}
            <h3 className={styles.cardTitle}>{p.nome}</h3>
            
            {/* Bio/descrição curta */}
            <p className={styles.cardBio}>
              {p.bio || "Sem bio para este personagem."}
            </p>

            {/* ========== SEÇÃO DE INTERAÇÕES ========== */}
            {/* Botões para like, comentário e favorito */}
            <div className={styles.interactions}>
              
              {/* ========== BOTÃO LIKE/CURTIDA ========== */}
              {/* 
                - Mostra número de curtidas
                - SVG muda de cor (vermelho quando curtido)
                - Chama handleLike ao clicar
              */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike(p.id);
                }}
                className={`${styles.likeButton} ${
                  curtidas[p.id] ? styles.active : ""  // Adiciona classe "active" se curtido
                }`}
              >
                <span>{likes[p.id] ?? 0}</span>  {/* Exibe número de likes */}
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

              {/* ========== BOTÃO COMENTÁRIO ========== */}
              {/* 
                - Placeholder (não implementado ainda, mostra 0)
                - Mantém para futura funcionalidade
              */}
              <button
                className={styles.commentButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <span>0</span>  {/* Comentários ainda não implementados */}
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

              {/* ========== BOTÃO FAVORITO/ESTRELA ========== */}
              {/* 
                - Mostra estrela vazia ou preenchida
                - Amarela (#FFD700) quando favoritado
                - Cinza quando não favoritado
                - Chama handleFavorito ao clicar
              */}
              <button
                className={styles.favorito}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFavorito(p);
                }}
              >
                <i
                  className={`fa ${
                    p.favoritadoPeloUsuario
                      ? "fa-solid fa-star"      /* Estrela preenchida */
                      : "fa-regular fa-star"    /* Estrela vazia */
                  }`}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    color: p.favoritadoPeloUsuario
                      ? "#FFD700"  /* Amarelo quando favoritado */
                      : "#888"     /* Cinza quando não favoritado */
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
