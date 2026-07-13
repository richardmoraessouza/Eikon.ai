'use client'; // Necessário no Next.js (App Router) para o uso de useState e interações

import { useState } from 'react';
import CharacterCard from '../../character/CharacterCard/CharacterCard';
import { useAuth } from '@/contexts/AuthContext/AuthContext';

interface TapsPerfilProps {
    usuarioId?: number | null;
    hideFavoriteCharacter?: boolean;
    hideRecentCharacter?: boolean;
}

const TapsPerfil = ({
    usuarioId,
    hideFavoriteCharacter: hideFavoriteFromProfile,
    hideRecentCharacter: hideRecentFromProfile,
}: TapsPerfilProps) => {
    const [abaAtiva, setAbaAtiva] = useState<string>('Personagens');

    const { hideFavoriteCharacter, hideRecentCharacter, usuarioId: loggedUsuarioId } = useAuth();

    const isOwnProfile = usuarioId != null && loggedUsuarioId != null && usuarioId === loggedUsuarioId;
    const hideFavorites = isOwnProfile ? false : (hideFavoriteFromProfile ?? hideFavoriteCharacter);
    const hideRecents = isOwnProfile ? false : (hideRecentFromProfile ?? hideRecentCharacter);

    const tabs = [
        { key: 'Personagens', label: 'Personagens' },
        { key: 'Favoritos', label: `Favoritos${hideFavorites ? ' (Oculto)' : ''}` },
        { key: 'Recentes', label: `Recentes${hideRecents ? ' (Oculto)' : ''}` },
    ];

    const activeTab = tabs.some((tab) => tab.key === abaAtiva) ? abaAtiva : tabs[0]?.key || 'Personagens';

    return (
        <section className="w-full flex flex-col justify-center items-center gap-7 mb-4 text-sm">
            <nav className="w-full flex justify-center items-center gap-4 mb-4 text-sm text-gray-400">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setAbaAtiva(tab.key)}
                        className={`transition-colors duration-200 cursor-pointer hover:text-white ${
                            activeTab === tab.key ? 'text-white font-medium' : ''
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {activeTab === 'Personagens' && <CharacterCard type="meus-personagens" abaAtiva={activeTab} usuarioId={usuarioId} />}
            {activeTab === 'Favoritos' && (
                hideFavorites ? (
                    <div className="w-full flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400">
                        <p className="font-medium">Favoritos ocultos</p>
                        <p className="mt-2">Este usuário optou por ocultar o histórico de personagens favoritos.</p>
                    </div>
                ) : (
                    <CharacterCard type="favoritos" abaAtiva={activeTab} usuarioId={usuarioId} hideFavoriteCharacter={hideFavorites} />
                )
            )}
            {activeTab === 'Recentes' && (
                hideRecents ? (
                    <div className="w-full flex flex-col items-center justify-center p-6 text-center text-sm text-gray-400">
                        <p className="font-medium">Recentes ocultos</p>
                        <p className="mt-2">Este usuário optou por ocultar o histórico de personagens recentemente falados.</p>
                    </div>
                ) : (
                    <CharacterCard type="recentes" abaAtiva={activeTab} usuarioId={usuarioId} hideRecentCharacter={hideRecents} />
                )
            )}
        </section>
    );
};

export default TapsPerfil;