"use client";

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import axios from 'axios';
import { API_URL } from '@/config/api';
import { dispatchFrameUpdated, normalizeFrame } from '@/utils/frame';
import { clearCurrentAuthToken, getCurrentAuthToken, setCurrentAuthToken } from '@/config/authTokenStore';
interface UserData {
    id: number;
    nome: string;
    gmail: string;
    foto_perfil?: string; 
    descricao?: string;
    username?: string;
    hide_favorite_character?: boolean;
    hide_recent_character?: boolean;
    hide_followers?: boolean;
    hide_following?: boolean;
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
    hideFavoriteCharacter: boolean;
    hideRecentCharacter: boolean;
    hideFollowers: boolean;
    hideFollowing: boolean;
    token: string | null;
    estaLogado: boolean;
    loading: boolean;
    login: (userData: UserData) => void;
    logout: () => void;
    updateProfile: (profileData: { nome?: string; foto_perfil?: string; descricao?: string; username?: string; frame?: string | null; hideFavoriteCharacter?: boolean; hideRecentCharacter?: boolean; hideFollowers?: boolean; hideFollowing?: boolean }) => void;
}

const initialContextValue: AuthContextType = {
    usuario: null,
    usuarioId: null,
    username: null,
    fotoPerfil: null,
    descricao: null,
    frame: null,
    hideFavoriteCharacter: false,
    hideRecentCharacter: false,
    hideFollowers: false,
    hideFollowing: false,
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
    const [hideFavoriteCharacter, setHideFavoriteCharacter] = useState<boolean>(false);
    const [hideRecentCharacter, setHideRecentCharacter] = useState<boolean>(false);
    const [hideFollowers, setHideFollowers] = useState<boolean>(false);
    const [hideFollowing, setHideFollowing] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
                const userData = response.data;
                const recoveredToken = userData?.token ?? getCurrentAuthToken();

                if (recoveredToken) {
                    setCurrentAuthToken(recoveredToken);
                    setToken(recoveredToken);
                } else {
                    setToken(null);
                }

                if (userData?.id) {
                    setUsuario(userData.nome || null);
                    setUsuarioId(userData.id);
                    setUsername(userData.username || null);
                    setFotoPerfil(userData.foto_perfil || null);
                    setDescricao(userData.descricao || null);
                    setFrame(normalizeFrame(userData.frame));
                    setHideFavoriteCharacter(Boolean(userData.hide_favorite_character ?? false));
                    setHideRecentCharacter(Boolean(userData.hide_recent_character ?? false));
                    setHideFollowers(Boolean(userData.hide_followers ?? false));
                    setHideFollowing(Boolean(userData.hide_following ?? false));
                }
            } catch (err) {
                console.warn('[Auth] Sessão não recuperada:', err);
                clearCurrentAuthToken();
                setToken(null);
                setUsuario(null);
                setUsuarioId(null);
                setUsername(null);
                setFotoPerfil(null);
                setDescricao(null);
                setFrame(null);
                setHideFavoriteCharacter(false);
                setHideRecentCharacter(false);
                setHideFollowers(false);
                setHideFollowing(false);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = (userData: UserData) => {
        if (userData.token) {
            setCurrentAuthToken(userData.token);
        }

        setToken(userData.token || null);
        setUsuario(userData.nome);
        setUsuarioId(userData.id);
        setUsername(userData.username || null);
        setFotoPerfil(userData.foto_perfil || null);
        setDescricao(userData.descricao || null);
        setFrame(normalizeFrame(userData.frame));
        setHideFavoriteCharacter(Boolean(userData.hide_favorite_character));
        setHideRecentCharacter(Boolean(userData.hide_recent_character));
        setHideFollowers(Boolean(userData.hide_followers));
        setHideFollowing(Boolean(userData.hide_following));
    };

    const logout = () => {
        clearCurrentAuthToken();
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

    const updateProfile = (profileData: { nome?: string; foto_perfil?: string; descricao?: string; username?: string; frame?: string | null; hideFavoriteCharacter?: boolean; hideRecentCharacter?: boolean; hideFollowers?: boolean; hideFollowing?: boolean }) => {
        if (profileData.nome) {
            setUsuario(profileData.nome);
        }
        if (profileData.foto_perfil) {
            setFotoPerfil(profileData.foto_perfil);
        }
        if (profileData.descricao !== undefined) {
            setDescricao(profileData.descricao);
        }
        if (profileData.username !== undefined) {
            setUsername(profileData.username || null);
        }
        if (profileData.frame !== undefined) {
            const frameValue = normalizeFrame(profileData.frame);
            setFrame(frameValue);

            if (usuarioId) {
                dispatchFrameUpdated(usuarioId, frameValue);
            }
        }
        if (profileData.hideFavoriteCharacter !== undefined) {
            setHideFavoriteCharacter(profileData.hideFavoriteCharacter);
        }
        if (profileData.hideRecentCharacter !== undefined) {
            setHideRecentCharacter(profileData.hideRecentCharacter);
        }
        if (profileData.hideFollowers !== undefined) {
            setHideFollowers(profileData.hideFollowers);
        }
        if (profileData.hideFollowing !== undefined) {
            setHideFollowing(profileData.hideFollowing);
        }
    };

    const contextValue: AuthContextType = {
        usuario,
        usuarioId,
        username,
        fotoPerfil,
        descricao,
        frame,
        hideFavoriteCharacter,
        hideRecentCharacter,
        hideFollowers,
        hideFollowing,
        token,
        estaLogado: Boolean(usuarioId),
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