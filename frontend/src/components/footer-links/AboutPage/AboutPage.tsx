'use client'; // Necessário para usar o hook useRouter() e eventos de clique (onClick)

import React from 'react';
import { useRouter } from 'next/navigation'; // Substitui o useNavigate do react-router-dom
import styles from './AboutPage.module.css';

const AboutPage: React.FC = () => {
  const router = useRouter(); // Instanciando o roteador do Next.js

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Botão de voltar perfeitamente padronizado */}
        <div 
          className={styles.backButton} 
          onClick={() => router.back()} // router.back() equivale ao navigate(-1)
          role="button"
          tabIndex={0}
        >
          <span>‹</span> Sobre a Eikon.ai
        </div>

        <h1>Sobre a Eikon.ai</h1>
        
        <section>
          <h2>O que é a Eikon.ai?</h2>
          <p>
            Eikon.ai é uma plataforma inovadora de chat que permite você conversar com personagens criados e alimentados por 
            Inteligência Artificial. Nossa missão é proporcionar um espaço seguro, criativo e divertido onde usuários possam 
            explorar diferentes personalidades, histórias e perspectivas através de interações inteligentes.
          </p>
        </section>

        <section>
          <h2>Nossa Visão</h2>
          <p>
            Imaginamos um futuro onde a tecnologia de IA pode criar conexões significativas e proporcionar experiências 
            personalizadas. Eikon.ai é o primeiro passo nessa jornada, oferecendo uma plataforma onde a criatividade encontra 
            a tecnologia.
          </p>
        </section>

        <section>
          <h2>Como Funciona?</h2>
          <p>
            Eikon.ai funciona através de modelos avançados de Inteligência Artificial que:
          </p>
          <ul>
            <li>Processam suas mensagens em tempo real;</li>
            <li>Geram respostas baseadas na personalidade e contexto do personagem;</li>
            <li>Mantêm a coerência e imersão durante longas sessões de conversação;</li>
            <li>Respeitam as limitações de segurança e conteúdo apropriado.</li>
          </ul>
        </section>

        <section>
          <h2>Privacidade e Segurança</h2>
          <p>
            Levamos sua privacidade e segurança muito a sério. Todos os dados são:
          </p>
          <ul>
            <li>Armazenados seguindo rígidos protocolos de criptografia e proteção contra acessos maliciosos;</li>
            <li>Protegidos na camada de transporte via conexões SSL/HTTPS seguras;</li>
            <li>Nunca comercializados ou compartilhados com terceiros sem consentimento explícito;</li>
            <li>Sujeitos à nossa Política de Privacidade e em estrita conformidade legal.</li>
          </ul>
        </section>

        <section>
          <h2>Comunidade e Criação</h2>
          <p>
            Eikon.ai é moldada por criadores. Na nossa plataforma, você pode:
          </p>
          <ul>
            <li>Criação de novos personagens customizados com diretrizes específicas;</li>
            <li>Compartilhar suas criações e interagir com o catálogo público da comunidade;</li>
            <li>Explorar cenários fictícios, assistentes de produtividade e ferramentas de RPG.</li>
          </ul>
        </section>

        <section>
          <h2>Valores Fundamentais</h2>
          <p>
            Guiamos o desenvolvimento do ecossistema sob os seguintes pilares:
          </p>
          <ul>
            <li><strong>Transparência:</strong> Clareza total sobre o processamento de dados e limitações de modelos generativos;</li>
            <li><strong>Controle do Usuário:</strong> Você tem total autonomia para gerenciar seu histórico e preferências de conta;</li>
            <li><strong>Segurança Contínua:</strong> Auditorias periódicas para blindar a infraestrutura e mitigar brechas digitais;</li>
            <li><strong>Fomento à Expressão:</strong> Estímulo à originalidade criativa dentro de limites éticos e seguros.</li>
          </ul>
        </section>

        {/* Última atualização e Rodapé juntos lá embaixo */}
        <footer className={styles.footer}>
          <p className={styles.lastUpdated}>Última atualização: 19 de junho de 2026</p>
          <p>© {new Date().getFullYear()} Eikon.ai — Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;