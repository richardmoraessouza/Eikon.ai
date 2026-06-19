import React from 'react';
import styles from './quick-create.module.css';

interface QuickCreateModeProps {
  nome: string;
  bio: string;
  descricao: string;
  obra: string;
  quick_prompt: string;
  isFiccional: boolean;
  conversation_style: string;
  is_modo_rapido: boolean;
  onNomeChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onConversationStyleChange: (value: string) => void;
  onDescricaoChange: (value: string) => void;
  onObraChange: (value: string) => void;
  onQuick_prompt: (value: string) => void;
  onIs_modo_rapido: (value: boolean) => void;
}
const validarNome = (texto: string) => {
  // Remove caracteres especiais, mantendo apenas letras, números e espaços
  const limpo = texto.replace(/[^A-Za-zÀ-ú0-9 ]/g, '');
  // Verifica se tem conteúdo após remover espaços e se tem pelo menos uma letra
  return limpo.trim().length > 0 && /[A-Za-zÀ-ú]/.test(limpo) ? limpo : '';
};

export const QuickCreateMode: React.FC<QuickCreateModeProps> = ({ 
  nome, 
  bio,
  conversation_style,
  descricao, 
  obra,
  quick_prompt,
  isFiccional,
  onIs_modo_rapido,
  onNomeChange,
  onQuick_prompt,
  onBioChange,
  onConversationStyleChange,
  onDescricaoChange,
  onObraChange
}) => {

  React.useEffect(() => {
    onIs_modo_rapido(true);
    return () => onIs_modo_rapido(false);
  }, [])
  
  return (
    <div className={styles.modoRapidoContainer}>      
      <div className={styles.formGroup}>
        <label htmlFor="nome_rapido">Nome do Personagem: </label>
        <input
          id="nome_rapido"
          type="text"
          value={nome}
          required
          maxLength={20}
          placeholder="Ex: Shadow the Hedgehog"
          onChange={(e) => {
            onNomeChange(validarNome(e.target.value));
          }}
          className={styles.input}
        />
        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{nome.length}/20 palavras</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="bio_rapido">Bio</label>
        <input
          id="bio_rapido"
          type="text"
          value={bio}
          maxLength={50}
          placeholder="Ex: Um guerreiro ciberpunk"
          onChange={(e) => {
            onBioChange(e.target.value);
          }}
          className={styles.input}
        />
        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{bio.length}/50 palavras</p>
      </div>

      {isFiccional && (
        <div className={styles.formGroup}>
          <label htmlFor="obra_rapido">Obra / Universo</label>
          <input
            id="obra_rapido"
            type="text"
            value={obra}
            placeholder="De qual obra/universo é este personagem?"
            required
            maxLength={50}
            onChange={(e) => {
                onObraChange(e.target.value);
              }}
            className={styles.input}
          />
          <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{obra.length}/50 palavras</p>
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="descricao_rapido">Descrição</label>
        <textarea
          id="descricao_rapido"
          value={descricao}
          maxLength={500}
          placeholder="Descrição para seu personagem"
          onChange={(e) => {
            onDescricaoChange(e.target.value);
          }}
          className={styles.textarea}
        />
        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{descricao.length}/500 caracteres</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="quick_prompt">Defina seu Personagem</label>
        <textarea
          id="quick_prompt"
          value={quick_prompt}
          maxLength={500}
          placeholder="Escreva em poucas palavras como você imagina o personagem. Ex: Um guerreiro de poucas palavras, ranzinza, mas com um coração gigante..."
          className={styles.textarea}
          onChange={(e) => {
            onQuick_prompt(e.target.value);
          }}
        />
        <p style={{ color: 'var(--input-placeholder)', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>{quick_prompt.length}/500 caracteres</p>
      </div>

       <div className={styles.formGroup}>
            <label htmlFor="Como ele conversa?">Como ele conversa?</label>
            <select 
            id="Como ele conversa?"
            value={conversation_style} 
            onChange={(e) => onConversationStyleChange(e.target.value)}
            className={styles.selectEstilo}
            >
            <option value="Modo Direto">Estilo Ágil (Casual/Direto)</option>
            <option value="narrativo">Estilo Imersivo (Narrativo)</option>
            <option value="robotico">Robótico (Lógico/Analítico)</option>
            <option value="dinamico">Dinâmico (Híbrido)</option>
            </select>
        </div>
    </div>
  );
};