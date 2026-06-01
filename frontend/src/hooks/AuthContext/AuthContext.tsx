import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

// Tipo do Objeto de Dados que o Back-end retorna no LOGIN/EDIÇÃO
interface UserData {
    id: number;
    nome: string;
    gmail: string;
    foto_perfil?: string; 
    descricao?: string;
    token: string;
}

// Tipo do Contexto (O objeto que será exposto para os componentes)
interface AuthContextType {
    usuario: string | null;
    usuarioId: number | null;
    fotoPerfil: string | null;
    descricao: string | null;
    token: string | null;
    estaLogado: boolean;
    loading: boolean;
    login: (userData: UserData) => void;
    logout: () => void;
    updateProfile: (profileData: { nome?: string; foto_perfil?: string; descricao?: string }) => void;
}

// Inicializamos o contexto com valores nulos e funções vazias
const initialContextValue: AuthContextType = {
    usuario: null,
    usuarioId: null,
    fotoPerfil: null,
    descricao: null, 
    token: null,
    estaLogado: false,
    loading: true,
    login: () => {},
    logout: () => {},
    updateProfile: () => {},
};

// --- CRIAÇÃO DO CONTEXTO ---
const AuthContext = createContext<AuthContextType>(initialContextValue);

// --- PROVIDER ---
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [usuario, setUsuario] = useState<string | null>(null);
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [descricao, setDescricao] = useState<string | null>(null); 
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Inicializa estados a partir do localStorage ---
    useEffect(() => {
        const storedToken = localStorage.getItem('token')?.trim() || null;
        const storedNome = localStorage.getItem('usuario_nome')?.trim() || null;
        const storedId = localStorage.getItem('usuario_id')?.trim() || null;
        const storedFoto = localStorage.getItem('usuario_foto')?.trim() || null;
        const storedDescricao = localStorage.getItem('usuario_descricao')?.trim() || null;

        const parsedId = storedId ? parseInt(storedId, 10) : null;

        if (storedToken && storedNome && parsedId) {
            // Validar se o token é um JWT válido (começa com ey... e tem dots)
            if (storedToken.includes('.')) {
                setToken(storedToken);
                setUsuario(storedNome);
                setUsuarioId(parsedId);
                setFotoPerfil(storedFoto);
                setDescricao(storedDescricao);
            } else {
                console.warn('[Auth] Token no localStorage parece inválido, limpando...');
                localStorage.clear();
            }
        }

        setLoading(false); // carregamento finalizado
    }, []);

    // --- Função de login ---
    const login = (userData: UserData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('usuario_nome', userData.nome);
        localStorage.setItem('usuario_id', userData.id.toString());
        localStorage.setItem('usuario_foto', userData.foto_perfil || '');
        localStorage.setItem('usuario_descricao', userData.descricao || '');

        setToken(userData.token);
        setUsuario(userData.nome);
        setUsuarioId(userData.id);
        setFotoPerfil(userData.foto_perfil || null);
        setDescricao(userData.descricao || null);
    };

    // --- Função de logout ---
    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();

        setToken(null);
        setUsuario(null);
        setUsuarioId(null);
        setFotoPerfil(null);
        setDescricao(null);

        window.location.href = '/';
    };

    // --- Função para atualizar perfil ---
    const updateProfile = (profileData: { nome?: string; foto_perfil?: string; descricao?: string }) => {
        if (profileData.nome) {
            setUsuario(profileData.nome);
            localStorage.setItem('usuario_nome', profileData.nome);
        }
        if (profileData.foto_perfil) {
            setFotoPerfil(profileData.foto_perfil);
            localStorage.setItem('usuario_foto', profileData.foto_perfil);
        }
        if (profileData.descricao !== undefined) {
            setDescricao(profileData.descricao);
            localStorage.setItem('usuario_descricao', profileData.descricao);
        }
    };

    const contextValue: AuthContextType = {
        usuario,
        usuarioId,
        fotoPerfil,
        descricao,
        token,
        estaLogado: !!usuarioId,
        loading,
        login,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
