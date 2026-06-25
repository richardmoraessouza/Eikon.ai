'use client'; // Necessário no Next.js (App Router) devido ao uso de interações e do useRouter

import React from 'react';
import { useRouter } from 'next/navigation'; // Substitui o useNavigate do react-router-dom
import styles from './TermsPage.module.css';

const TermsPage: React.FC = () => {
  const router = useRouter(); // Instanciando o roteador do Next.js

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        
        {/* Botão de voltar padronizado com atributos de acessibilidade */}
        <div 
          className={styles.backButton} 
          onClick={() => router.back()} // router.back() substitui perfeitamente o navigate(-1)
          role="button"
          tabIndex={0}
        >
          <span>‹</span> Termos de Serviço da Eikon.ai
        </div>

        <h1>Termos de Serviço</h1>
        
        <section>
          <p>
            Esta página descreve as regras, diretrizes e responsabilidades ao utilizar a plataforma Eikon.ai. 
            Ao acessar ou interagir com nossos serviços, você confirma que leu, compreendeu e concorda em cumprir integralmente com os termos estabelecidos abaixo.
          </p>
        </section>

        <section>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar a plataforma Eikon.ai, você concorda em cumprir estes Termos de Serviço. 
            Se não concordar com qualquer parte destes termos, você não deve usar este serviço.
          </p>
        </section>

        <section>
          <h2>2. Uso do Serviço</h2>
          <p>
            Eikon.ai é uma plataforma de chat com personagens de Inteligência Artificial. Você concorda em usar o serviço 
            apenas para fins legais e de forma que não viole os direitos de terceiros ou restrinja o uso e aproveitamento 
            do serviço por outras partes.
          </p>
          <ul>
            <li>Você não pode usar a plataforma para enviar conteúdo ilegal, ofensivo ou prejudicial;</li>
            <li>Você não pode tentar ganhar acesso não autorizado aos sistemas do servidor;</li>
            <li>Você não pode copiar, extrair ou distribuir conteúdo gerado sem a devida autorização;</li>
            <li>Você não pode assediar, simular comportamentos abusivos ou prejudicar outros usuários.</li>
          </ul>
        </section>

        <section>
          <h2>3. Conteúdo Gerado por IA</h2>
          <p>
            As respostas dos personagens são geradas de forma automatizada por modelos de Inteligência Artificial. 
            Compreendemos que essas respostas podem conter imprecisões, alucinações de IA, erros ou não refletir com total precisão 
            opiniões de pessoas ou entidades reais. Você reconhece e aceita esse fato ao usar a plataforma.
          </p>
        </section>

        <section>
          <h2>4. Processamento e Armazenamento de Dados</h2>
          <p>
            Todas as mensagens que você envia no ambiente de chat são processadas por Inteligência Artificial e armazenadas 
            em nosso banco de dados relacional seguro para permitir a persistência da sua sessão e dar continuidade ao seu histórico de conversação.
          </p>
        </section>

        <section>
          <h2>5. Limitação de Responsabilidade</h2>
          <p>
            A Eikon.ai não será responsável por quaisquer danos indiretos, incidentais, especiais, consequentes ou 
            punitivos resultantes do uso ou da incapacidade de usar o serviço de chat, inclusive imprecisões originadas pelas respostas dos modelos de linguagem.
          </p>
        </section>

        <section>
          <h2>6. Modificações dos Termos</h2>
          <p>
            Reservamos o direito de modificar estes termos a qualquer momento. Mudanças significativas na nossa estrutura legal serão comunicadas 
            aos usuários através de avisos na plataforma. O uso continuado do serviço após as modificações constitui aceitação dos novos termos.
          </p>
        </section>

        <footer className={styles.footer}>
          <p>Última atualização: 19 de junho de 2026</p>
          <p>© {new Date().getFullYear()} Eikon.ai — Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;