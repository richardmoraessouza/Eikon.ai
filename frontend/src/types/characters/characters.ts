export interface Character {
    id: number;
    nome: string;
    usuario_id?: number;
    bio?: string;
    fotoia?: string;
    tags?: Array<string | { nome?: string | null; name?: string | null } | null>;
    likes?: number;
    visualizacoes?: number;
    curtidoPeloUsuario?: boolean;
    favoritadoPeloUsuario?: boolean;
    popular?: boolean;
    destaque?: boolean;
    public_id: string;
    is_public?: boolean;
    publico?: boolean;
  }
  

export interface CharacterbyId {
  id: number;
  nome: string;
  fotoia?: string;
  descricao?: string;
  obra?: string;
  tipo_personagem?: string;
  historia?: string;
  genero?: string;
  personalidade?: string;
  comportamento?: string;
  estilo?: string;
  quick_prompt?: string;
  regras?: string;
  usuario_id: number;
  bio?: string;
  objetivos?: string;
  aparencia?: string;
  desgostos?: string;
  gostos?: string;
  primeiramensagem?: string;
  exemplosconversa?: string;
  is_modo_rapido?: boolean;
  cenario?: string;
  relacaousuario?: string;
  conversation_style?: string;
  criador?: string;
  likes?: number;
  curtidoPeloUsuario?: boolean;
  visualizacoes?: number;
  favoritadoPeloUsuario?: boolean;
  public_id: string;
}

// increment the number of views of the character's chat
export interface views {
  personagemId: number;
}

export interface Tag {
    id: number;
    nome: string;
    slug: string;
}

// registra um personagem como recentemente acessado pelo usuário
export interface RecentCharacter {
  usuarioId: number;
  personagemId: number;
}

export interface VisibilityResponse {
    public_id: string;
    nome: string;
    is_public: boolean;
    usuario_id?: number;
}