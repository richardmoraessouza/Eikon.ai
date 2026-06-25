'use client'; // Necessário no Next.js (App Router) para gerenciar estados de formulários e rotas

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Substitui o useNavigate do react-router-dom
import styles from './Feedback.module.css';

const Feedback: React.FC = () => {
  const router = useRouter(); // Instanciando o roteador do Next.js
  const [formData, setFormData] = useState({ category: 'sugestao', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integração com sua API futuramente aqui
    console.log('Feedback enviado:', formData);
    setSent(true);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Botão de Voltar */}
      <button 
        onClick={() => router.back()} // router.back() substitui o navigate(-1)
        className={styles.backButton}
        type="button"
      >
        ← Voltar
      </button>

      <header className={styles.header}>
        <h1>Feedback & Sugestões</h1>
        <p>Sua opinião nos ajuda a moldar o futuro do Eikon.ai.</p>
      </header>

      {sent ? (
        <div className={styles.successCard}>
          <h3>Muito obrigado! 🚀</h3>
          <p>Sua mensagem foi recebida com sucesso. Analisamos todas as sugestões da nossa comunidade.</p>
          <div className={styles.successActions}>
            <button 
              type="button"
              onClick={() => { setSent(false); setFormData({ category: 'sugestao', message: '' }); }}
              className={styles.secondaryButton}
            >
              Enviar outro feedback
            </button>
            <button 
              type="button" 
              onClick={() => router.push('/explorar')} // router.push() substitui o navigate('/rota')
              className={styles.primaryButton}
            >
              Voltar para Explorar
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="category">Tipo de Feedback</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="sugestao">Sugestão de Feature</option>
              <option value="bug">Relatar um Problema/Bug</option>
              <option value="elogio">Elogio</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Sua Mensagem</label>
            <textarea
              id="message"
              required
              rows={6}
              placeholder="Descreva detalhadamente o que você gostaria de ver ou o que aconteceu..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Enviar Feedback
          </button>
        </form>
      )}
    </div>
  );
};

export default Feedback;