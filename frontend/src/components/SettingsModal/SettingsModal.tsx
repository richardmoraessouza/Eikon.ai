import React, { useState } from 'react';
import styles from './SettingsModal.module.css';
import TapsProfileEdit from './Taps/TapsProfileEdit/TapsProfileEdit';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Estado para controlar qual aba lateral está ativa
  const [activeTab, setActiveTab] = useState<string>('conta');

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      
      {/* Container Principal do Modal */}
      <div className={`${styles.modalContainer} relative flex w-full max-w-4xl h-[550px] text-white rounded-2xl overflow-hidden shadow-2xl`}>
        
        {/* Botão de Fechar (X) no canto superior direito */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl font-bold z-10 cursor-pointer"
        >
          ✕
        </button>

        {/* --- BARRA LATERAL (SIDEBAR) --- */}
        <div className={`${styles.sidebar} w-1/3 flex flex-col justify-between p-6 border-r border-gray-800`}>
          
          {/* Opções de Navegação */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('perfil')}
              className={`${styles.navButton} ${activeTab === 'perfil' ? styles.active : ''}`}
            >
              Perfil público
            </button>
            <button
              onClick={() => setActiveTab('conta')}
              className={`${styles.navButton} ${activeTab === 'conta' ? styles.active : ''}`}
            >
              Conta
            </button>
            <button
              onClick={() => setActiveTab('preferencias')}
              className={`${styles.navButton} ${activeTab === 'preferencias' ? styles.active : ''}`}
            >
              Preferências
            </button>
            <button
              onClick={() => setActiveTab('molduras')}
              className={`${styles.navButton} ${activeTab === 'molduras' ? styles.active : ''}`}
            >
              Molduras
            </button>
          </div>

        </div>

        {/* --- CONTEÚDO DINÂMICO (RIGHT SIDE) --- */}
        <div className="w-2/3 p-8 flex flex-col justify-between bg-[#18181b]">
          
          {/* Renderização condicional baseada na aba ativa */}
          <div>
            {activeTab === 'perfil' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Perfil</h2>
                <TapsProfileEdit />
                
              </div>
            )}

            {activeTab === 'conta' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Conta</h2>
                
                {/* Bloco de Plano Atual idêntico ao do print */}
                <div className="bg-[#202024] p-4 rounded-xl flex justify-between items-center border border-zinc-800">
                  <div>
                    <span className="text-xs text-zinc-400 block mb-1">O seu plano atual</span>
                    <span className="text-base font-semibold">Grátis</span>
                  </div>
                  <button className="bg-[#007aff] hover:bg-blue-600 font-medium text-sm px-5 py-2 rounded-full transition-colors">
                    Atualizar
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferencias' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Preferências</h2>
                <p className="text-gray-400 text-sm">Configure o idioma, tema e som da aplicação.</p>
              </div>
            )}

            {activeTab === 'molduras' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Molduras</h2>
                <p className="text-gray-400 text-sm">Escolha as molduras de avatar disponíveis para o seu perfil.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default SettingsModal;