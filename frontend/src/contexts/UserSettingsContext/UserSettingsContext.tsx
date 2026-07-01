"use client";

import { createContext, useContext, useState } from 'react';

interface UserSettingsContextType {
    // Privacidade
    hideFavoriteCharacters: boolean;
    hideRecentCharacters: boolean;
    hideCreatedCharacters: boolean;

    // Chat
    showFrameInChat: boolean;
    chatColor: string;

    // Setters
    updateSetting: (key: keyof Omit<UserSettingsContextType, 'updateSetting'>, value: boolean | string) => void;
}

const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState({
        hideFavoriteCharacters: false,
        hideRecentCharacters: false,
        hideCreatedCharacters: false,
        showFrameInChat: false,
        chatColor: '#6B48D0',
    });

    function updateSetting(key: string, value: boolean | string) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    return (
        <UserSettingsContext.Provider value={{ ...settings, updateSetting }}>
            {children}
        </UserSettingsContext.Provider>
    );
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext);
    if (!context) throw new Error('useUserSettings deve estar dentro de UserSettingsProvider');
    return context;
}