# 📚 Documentação - CharacterCard.tsx

## 🎯 Propósito Geral
Componente que exibe cards de personagens em diferentes contextos:
- **Meus Personagens**: Lista dos personagens criados pelo usuário logado
- **Favoritos**: Personagens favoritados (pode ser de outro usuário)
- **Recentes**: Personagens visualizados recentemente pelo usuário

---

## 🔧 Tipos e Interfaces

### `Personagem`
```typescript
interface Personagem {
  id: number;                      // ID único do personagem
  nome: string;                    // Nome do personagem
  fotoia?: string;                 // URL da foto/IA
  bio?: string;                    // Biografia
  descricao?: string;              // Descrição completa
  likes?: number;                  // Quantidade de likes
  criador?: string;                // Quem criou
  usuario_id: number;              // ID do criador
  tipo_personagem: string;         // "person" ou "person-ficticio"
  curtidoPeloUsuario?: boolean;   // Se o usuário logado curtiu
  favoritadoPeloUsuario?: boolean; // Se o usuário logado favoritou
}
```

### `CharacterCardProps`
```typescript
interface CharacterCardProps {
  type: "meus-personagens" | "favoritos" | "recentes";  // Tipo de view
  abaAtiva?: string;                                     // Aba ativa (trigger para reload)
  usuarioId?: number | null;                             // ID do usuário a visualizar
}
```

---

## 🎪 Estados (useState)

| Estado | Tipo | Propósito |
|--------|------|----------|
| `personagensLocal` | `Personagem[]` | Personagens criados pelo usuário (meus-personagens) |
| `favoritos` | `Personagem[]` | Personagens favoritados |
| `recentes` | `Personagem[]` | Personagens visualizados recentemente |
| `loading` | `boolean` | Controla spinner de carregamento |
| `curtidas` | `{ [key: number]: boolean }` | Rastreia likes do usuário para cada personagem |
| `likes` | `{ [key: number]: number }` | Quantidade total de likes para cada personagem |

---

## 🔐 Variáveis Importantes

```typescript
const { usuarioId: loggedUsuarioId, token } = useAuth();
// ↑ Usuário autenticado (sempre confiável, vem do JWT)

const usuarioIdFinal = externalUsuarioId !== undefined ? externalUsuarioId : loggedUsuarioId;
// ↑ ID do usuário sendo visualizado (pode ser outro usuário)
```

### Fluxo de Segurança
- **Ações do usuário** (like, favorito) → SEMPRE usam `loggedUsuarioId` + `token`
- **Dados exibidos** → Buscam dados de `usuarioIdFinal` (pode ser outro usuário)
- Backend ignora URL parameters, confia apenas no JWT ✅

---

## ⚙️ Funções Principais

### 🔄 `enriquecerComLikes(personagens, usuarioId, isFavoritos)`
**O quê faz**: Complementa os dados dos personagens com likes e favoritos

**Lógica**:
1. Busca likes do usuário no backend (com token de autenticação)
2. Busca favoritos do usuário:
   - **Se está vendo SEUS próprios favoritos** → todos são favoritados
   - **Se está vendo favoritos de OUTRO usuário** → busca seus próprios para marcar
   - **Modo normal** → busca favoritos do usuário sendo visualizado
3. Busca quantidade de likes para cada personagem
4. Retorna personagens com campos preenchidos:
   - `curtidoPeloUsuario`: Esse usuário curtiu?
   - `favoritadoPeloUsuario`: Esse usuário favoritou?
   - `likes`: Quantidade de curtidas

---

## 🎣 Efeitos (useEffect)

### 1️⃣ Sincronizar Meus Personagens
```typescript
useEffect(() => { ... }, [personagens, type, usuarioIdFinal])
```
- **Quando**: Quando type = "meus-personagens" e há personagens
- **O quê**: Enriquece personagens locais com dados de favoritos
- **Resultado**: `personagensLocal` e `curtidas` sincronizados

---

### 2️⃣ Carregar Favoritos
```typescript
useEffect(() => { ... }, [type, usuarioIdFinal, abaAtiva, loggedUsuarioId, token])
```
- **Quando**: Quando type = "favoritos"
- **O quê**: 
  1. Busca favoritos de `usuarioIdFinal`
  2. Enriquece com likes
  3. Sincroniza curtidas locais
- **Resultado**: `favoritos[]` preenchido e pronto para render

---

### 3️⃣ Carregar Recentes
```typescript
useEffect(() => { ... }, [type, usuarioIdFinal, abaAtiva, loggedUsuarioId, token])
```
- **Quando**: Quando type = "recentes"
- **O quê**: Similar ao carregar favoritos, mas para personagens recentes
- **Resultado**: `recentes[]` preenchido

---

### 4️⃣ Listener de Armazenamento
```typescript
useEffect(() => { ... }, [usuarioIdFinal, type])
```
- **Quando**: Montado e desmontado com o componente
- **O quê**: Escuta eventos `favoritos_updated` do localStorage
- **Por quê**: Quando favorito é alterado em outro lugar da app, recarrega a lista
- **Resultado**: Dados sempre sincronizados entre abas

---

## 🎬 Handlers (Funções de Clique)

### ❤️ `handleLike(personagemId)`
**O quê faz**: Alterna like do usuário logado para um personagem

**Fluxo**:
1. Valida se usuário está logado + tem token
2. **Atualização otimista**: Muda UI imediatamente
3. Chama `toggleLike(loggedUsuarioId, personagemId, token)` no backend
4. **Se erro**: Reverte a UI para estado anterior
5. **Se 401**: Redireciona para login

**Segurança**: Sempre usa `loggedUsuarioId`, nunca `usuarioIdFinal` ✅

---

### ⭐ `handleFavorito(personagem)`
**O quê faz**: Alterna favorito do usuário logado para um personagem

**Fluxo**:
1. Valida autenticação
2. Chama `toggleFavorito(loggedUsuarioId, p.id, token)`
3. Atualiza localStorage (trigger para outros listeners)
4. **Atualiza estado local**:
   - **meus-personagens**: Apenas marca/desmarca
   - **favoritos (seus próprios)**: Remove do array se desfavoritar
   - **favoritos (outro usuário)**: Apenas marca/desmarca visualmente
   - **recentes**: Apenas marca/desmarca

**Comportamento especial**:
- ✅ Não remove favoritos de outro usuário (apenas atualiza visualmente)
- ✅ Remove seus próprios favoritos quando desfavoritar

**Segurança**: Sempre usa `loggedUsuarioId` ✅

---

## 🎨 Renderização

### 1. **Estado de Carregamento**
```typescript
if (loading) return <p>Carregando...</p>
```

### 2. **Escolher Dados**
```typescript
let dataToRender: Personagem[] = [];
if (type === "meus-personagens") dataToRender = personagensLocal;
else if (type === "favoritos") dataToRender = favoritos;
else if (type === "recentes") dataToRender = recentes;
```

### 3. **Estado Vazio**
```typescript
if (dataToRender.length === 0) return <p>Nenhum personagem...</p>
```

### 4. **Renderizar Cards**
Para cada personagem, mostra um card com:

| Elemento | Condição | Função |
|----------|----------|--------|
| **Botão Editar** | Apenas se `type === "meus-personagens"` E é o próprio usuário | Navega para edição |
| **Imagem** | Sempre | Clicável para navegar |
| **Nome** | Sempre | Exibição do nome |
| **Bio** | Sempre | Exibição da bio |
| **Like Button** | Sempre | Alterna like do usuário |
| **Comment Button** | Sempre | Placeholder (0 comentários) |
| **Star Button** | Sempre | Alterna favorito |

---

## 🚀 Fluxo de Clique no Card

```
Clique no card
    ↓
Detecta alvo (target)
    ↓
É botão? → Executa ação do botão (handleLike, handleFavorito, etc)
É imagem? → Apenas exibe (sem navegação)
Outro? → Navega para /personagem/{id}
```

**Código**:
```typescript
onClick={(e) => {
  const isButton = (e.target as HTMLElement).closest('button');
  const isImg = (e.target as HTMLElement).closest('img');
  if (!isButton && !isImg) {
    window.location.href = `/personagem/${p.id}`;
  }
}}
```

---

## 🔒 Segurança - Resumo

| Operação | Usuario | Fonte | Confiável? |
|----------|---------|-------|-----------|
| Like | `loggedUsuarioId` | JWT Token | ✅ Backend valida |
| Favorito | `loggedUsuarioId` | JWT Token | ✅ Backend valida |
| Dados exibidos | `usuarioIdFinal` | URL/Props | ⚠️ Apenas leitura |

**Regra de Ouro**: 
- **Lê** dados de qualquer usuário
- **Escreve** apenas como usuário autenticado (JWT)

---

## 🐛 Problemas Resolvidos

1. **Cross-user contamination**: ✅ Usa `loggedUsuarioId` para ações
2. **401 Unauthorized**: ✅ Token enviado em todas as requisições
3. **Button navigation**: ✅ Detecta cliques em botões
4. **Star display**: ✅ Lógica específica para cada contexto
5. **Desfavoritar outros**: ✅ Não remove favoritos de outro usuário

---

## 📌 Checklist de Comportamento

- [ ] Likar personagem: apenas do usuário logado
- [ ] Desfavoritar seus próprios: remove da lista
- [ ] Desfavoritar de outro: apenas visual, não remove
- [ ] Botões não navegam
- [ ] Stars amarelas para favoritados
- [ ] Token enviado em requisições
- [ ] 401 redireciona para login
- [ ] Loading mostra spinner

