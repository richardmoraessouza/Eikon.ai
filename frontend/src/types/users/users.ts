// Interface única para dados do usuário/criador
export interface User {
    id: number;
    nome: string;
    gmail?: string;
    foto_perfil?: string;
    descricao?: string;
    avatarUrl?: string;
}

// Interface para resposta de atualização do usuário
export interface UpdateUserResponse {
    success: boolean;
    error?: string;
    usuario_atualizado?: User;
}

// Manter compatibilidade com código existente
export type creatorName = User;