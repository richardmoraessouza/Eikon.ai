import { useState } from "react";
import CharacterCard from "../CharacterCard/CharacterCard";

interface TapsPerfilProps {
    usuarioId?: number | null;
}

const TapsPerfil = ({ usuarioId }: TapsPerfilProps) => {
    const [abaAtiva, setAbaAtiva] = useState<string>('Personagens');

    return (
        <section className="w-full flex justify-center items-center gap-7 mb-4 text-sm flex-col">
            <nav className="w-full flex justify-center items-center gap-4 mb-4 text-sm text-gray-400">
                
                {/* Botão Personagens */}
                <button 
                    onClick={() => setAbaAtiva('Personagens')} 
                    className={`transition-colors duration-200 cursor-pointer ${
                        abaAtiva === 'Personagens' ? 'text-[#FFF]' : '#FFF'
                    }`}
                >
                    Personagens
                </button>
        
                {/* Botão Favoritos */}
                <button 
                    onClick={() => setAbaAtiva('Favoritos')} 
                    className={`transition-colors duration-200 cursor-pointer ${
                        abaAtiva === 'Favoritos' ? 'text-[#FFF]' : '#FFF'
                    }`}
                >
                    Favoritos
                </button>

                {/* Botão Recentes */}
                <button 
                    onClick={() => setAbaAtiva('Recentes')} 
                    className={`transition-colors duration-200 cursor-pointer ${
                        abaAtiva === 'Recentes' ? 'text-[#FFF]' : '#FFF'
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
    )
}

export default TapsPerfil;