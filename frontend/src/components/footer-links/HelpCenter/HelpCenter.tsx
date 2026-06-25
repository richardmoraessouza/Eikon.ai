'use client'; // Necessário no Next.js (App Router) devido ao uso de useState e eventos de clique

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Substitui o useNavigate do react-router-dom
import styles from './HelpCenter.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

const HelpCenter: React.FC = () => {
  const router = useRouter(); // Instanciando o roteador do Next.js
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Como criar um personagem no Eikon.ai?',
      answer: 'Para criar um personagem, clique em "Criar Personagem" no menu ou rodapé, defina o nome, a personalidade, a saudação inicial e dê o contexto base para a inteligência artificial agir de acordo com o esperado.'
    },
    {
      question: 'As minhas conversas são privadas?',
      answer: 'Sim, suas interações são vinculadas estritamente à sua conta. Processamos os dados para manter o histórico das mensagens ativos, respeitando as diretrizes de privacidade.'
    },
    {
      question: 'Por que a IA gerou uma resposta incorreta ou estranha?',
      answer: 'As respostas são automatizadas baseadas em modelos generativos de linguagem de grande escala. Elas podem conter inconsistências ou imprecisões históricas/factuais.'
    }
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Botão de Voltar */}
      <button 
        onClick={() => router.back()} // router.back() substitui perfeitamente o navigate(-1)
        className={styles.backButton}
        type="button" // Adicionado explicitamente como boa prática
      >
        ← Voltar
      </button>

      <header className={styles.header}>
        <h1>Central de Ajuda</h1>
        <p>Como podemos ajudar você hoje?</p>
      </header>

      <section className={styles.faqSection}>
        <h2>Perguntas Frequentes</h2>
        <div className={styles.accordion}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button 
                type="button"
                className={styles.questionButton}
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                aria-expanded={activeIndex === index} // Boa prática de acessibilidade para leitores de tela
              >
                {faq.question}
                <span>{activeIndex === index ? '−' : '+'}</span>
              </button>
              {activeIndex === index && (
                <div className={styles.answerContent}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;