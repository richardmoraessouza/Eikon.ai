'use client'; // Necessário no Next.js (App Router) para o uso de useState e interações

import { useState } from "react";
import CharacterCard from "../../character/CharacterCard/CharacterCard";

interface TapsPerfilProps {
    usuarioId?: number | null;
}

const TapsPerfil = ({ usuarioId }: TapsPerfilProps) => {
    const [abaAtiva, setAbaAtiva] = useState<string>('Personagens');

    return (
        <section className="w-full flex flex-col justify-center items-center gap-7 mb-4 text-sm">
            <nav className="w-full flex justify-center items-center gap-4 mb-4 text-sm text-gray-400">
                
                {/* Botão Personagens */}
                <button 
                    type="button"
                    onClick={() => setAbaAtiva('Personagens')} 
                    className={`transition-colors duration-200 cursor-pointer hover:text-white ${
                        abaAtiva === 'Personagens' ? 'text-white font-medium' : ''
                    }`}
                >
                    Personagens
                </button>
        
                {/* Botão Favoritos */}
                <button 
                    type="button"
                    onClick={() => setAbaAtiva('Favoritos')} 
                    className={`transition-colors duration-200 cursor-pointer hover:text-white ${
                        abaAtiva === 'Favoritos' ? 'text-white font-medium' : ''
                    }`}
                >
                    Favoritos
                </button>

                {/* Botão Recentes */}
                <button 
                    type="button"
                    onClick={() => setAbaAtiva('Recentes')} 
                    className={`transition-colors duration-200 cursor-pointer hover:text-white ${
                        abaAtiva === 'Recentes' ? 'text-white font-medium' : ''
                    }`}
                >
                    Recentes
                </button>
            </nav>

            {/* Renderização condicional dos componentes */}
            {abaAtiva === 'Personagens' && <CharacterCard type="meus-personagens" abaAtiva={abaAtiva} usuarioId={usuarioId}/>}
            {abaAtiva === 'Favoritos' && <CharacterCard type="favoritos" abaAtiva={abaAtiva} usuarioId={usuarioId}/>}
            {abaAtiva === 'Recentes' && <CharacterCard type="recentes" abaAtiva={abaAtiva} usuarioId={usuarioId}/>}
        </section>
    );
};

export default TapsPerfil;