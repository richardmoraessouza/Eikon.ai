'use client'; // Necessário no Next.js (App Router) para o uso de useState e interações

import { useState } from "react";
import CharacterCard from "../../character/CharacterCard/CharacterCard";

interface TapsPerfilProps {
    usuarioId?: number | null;
}

const TapsPerfil = ({ usuarioId }: TapsPerfilProps) => {
    const [abaAtiva, setAbaAtiva] = useState<string>('Personagens');

    const tabs = [
        { key: 'Personagens', label: 'Personagens' },
        { key: 'Favoritos', label: 'Favoritos' },
        { key: 'Recentes', label: 'Recentes' },
    ];

    return (
        <section className="w-full flex flex-col justify-center items-center gap-7 mb-4 text-sm">
            <nav className="w-full flex justify-center items-center gap-4 mb-4 text-sm text-gray-400">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setAbaAtiva(tab.key)}
                        className={`transition-colors duration-200 cursor-pointer hover:text-white ${
                            abaAtiva === tab.key ? 'text-white font-medium' : ''
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {abaAtiva === 'Personagens' && <CharacterCard type="meus-personagens" abaAtiva={abaAtiva} usuarioId={usuarioId} />}
            {abaAtiva === 'Favoritos' && <CharacterCard type="favoritos" abaAtiva={abaAtiva} usuarioId={usuarioId} />}
            {abaAtiva === 'Recentes' && <CharacterCard type="recentes" abaAtiva={abaAtiva} usuarioId={usuarioId} />}
        </section>
    );
};

export default TapsPerfil;