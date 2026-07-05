"use client";

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { searchCreatorNameService } from '@/services/users/userService';
import { dispatchFrameUpdated, normalizeFrame } from '@/utils/frame';
interface UserData {
    id: number;
    nome: string;
    gmail: string;
    foto_perfil?: string; 
    descricao?: string;
    username?: string;
    token: string;
    frame?: string | null;
}

interface AuthContextType {
    usuario: string | null;
    usuarioId: number | null;
    username: string | null;
    fotoPerfil: string | null;
    descricao: string | null;
    frame: string | null;
    token: string | null;
    estaLogado: boolean;
    loading: boolean;
    login: (userData: UserData) => void;
    logout: () => void;
    updateProfile: (profileData: { nome?: string; foto_perfil?: string; descricao?: string; username?: string; frame?: string | null }) => void;
}

const initialContextValue: AuthContextType = {
    usuario: null,
    usuarioId: null,
    username: null,
    fotoPerfil: null,
    descricao: null,
    frame: null,
    token: null,
    estaLogado: false,
    loading: true,
    login: () => {},
    logout: () => {},
    updateProfile: () => {},
};

const AuthContext = createContext<AuthContextType>(initialContextValue);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [usuario, setUsuario] = useState<string | null>(null);
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [descricao, setDescricao] = useState<string | null>(null);
    const [frame, setFrame] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const storedToken     = localStorage.getItem('token')?.trim() || null;
            const storedNome      = localStorage.getItem('usuario_nome')?.trim() || null;
            const storedId        = localStorage.getItem('usuario_id')?.trim() || null;
            const storedFoto      = localStorage.getItem('usuario_foto')?.trim() || null;
            const storedDescricao = localStorage.getItem('usuario_descricao')?.trim() || null;
            const storedFrame     = localStorage.getItem('usuario_frame')?.trim() || null;
            const storedUsername  = localStorage.getItem('usuario_username')?.trim() || null;

            const parsedId = storedId ? parseInt(storedId, 10) : null;

            if (storedToken && storedNome && parsedId) {
                if (storedToken.includes('.')) {
                    setToken(storedToken);
                    setUsuario(storedNome);
                    setUsuarioId(parsedId);
                    setUsername(storedUsername);
                    setFotoPerfil(storedFoto);
                    setDescricao(storedDescricao);
                    setFrame(storedFrame);

                    try {
                        const userData = await searchCreatorNameService(parsedId);

                        if (userData.nome) {
                            setUsuario(userData.nome);
                            localStorage.setItem('usuario_nome', userData.nome);
                        }

                        if (userData.username) {
                            setUsername(userData.username);
                            localStorage.setItem('usuario_username', userData.username);
                        }

                        if (userData.foto_perfil) {
                            setFotoPerfil(userData.foto_perfil);
                            localStorage.setItem('usuario_foto', userData.foto_perfil);
                        }

                        if (userData.descricao !== undefined) {
                            setDescricao(userData.descricao || null);
                            localStorage.setItem('usuario_descricao', userData.descricao || '');
                        }

                        if (userData.frame !== undefined) {
                            const frameFromApi = normalizeFrame(userData.frame);
                            setFrame(frameFromApi);
                            localStorage.setItem('usuario_frame', frameFromApi ?? '');
                        }
                    } catch (err) {
                        console.warn('[Auth] Não foi possível sincronizar perfil:', err);
                    }
                } else {
                    console.warn('[Auth] Token inválido, limpando...');
                    localStorage.clear();
                }
            }

            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = (userData: UserData) => {
        localStorage.setItem('token',              userData.token);
        localStorage.setItem('usuario_nome',       userData.nome);
        localStorage.setItem('usuario_id',         userData.id.toString());
        localStorage.setItem('usuario_username',   userData.username || '');
        localStorage.setItem('usuario_foto',       userData.foto_perfil || '');
        localStorage.setItem('usuario_descricao',  userData.descricao || '');
        localStorage.setItem('usuario_frame',      userData.frame || '');

        setToken(userData.token);
        setUsuario(userData.nome);
        setUsuarioId(userData.id);
        setUsername(userData.username || null);
        setFotoPerfil(userData.foto_perfil || null);
        setDescricao(userData.descricao || null);
        setFrame(normalizeFrame(userData.frame));
    };

    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();

        setToken(null);
        setUsuario(null);
        setUsuarioId(null);
        setUsername(null);
        setFotoPerfil(null);
        setDescricao(null);
        setFrame(null);

        window.location.href = '/';
    };

    const updateProfile = (profileData: { nome?: string; foto_perfil?: string; descricao?: string; username?: string; frame?: string | null }) => {
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
        if (profileData.username !== undefined) {
            setUsername(profileData.username || null);
            localStorage.setItem('usuario_username', profileData.username || '');
        }
        if (profileData.frame !== undefined) {
            const frameValue = normalizeFrame(profileData.frame);
            setFrame(frameValue);
            localStorage.setItem('usuario_frame', frameValue ?? '');

            if (usuarioId) {
                dispatchFrameUpdated(usuarioId, frameValue);
            }
        }
    };

    const contextValue: AuthContextType = {
        usuario,
        usuarioId,
        username,
        fotoPerfil,
        descricao,
        frame,
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