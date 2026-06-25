'use client'; // Necessário no Next.js (App Router) para o uso de interações e do useRouter

import React from 'react';
import { useRouter } from 'next/navigation'; // Substitui o useNavigate do react-router-dom
import styles from './PrivacyPage.module.css';

const PrivacyPage: React.FC = () => {
  const router = useRouter(); // Instanciando o roteador do Next.js

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Botão de voltar igual ao do TermsPage */}
        <div 
          className={styles.backButton} 
          onClick={() => router.back()} // router.back() substitui perfeitamente o navigate(-1)
          role="button"
          tabIndex={0}
        >
          <span>‹</span> Política de Privacidade da Eikon.ai
        </div>

        <h1>Política de Privacidade</h1>
        
        <section>
          <h2>1. Introdução</h2>
          <p>
            A privacidade de nossos usuários é de extrema importância. Esta Política de Privacidade explica detalhadamente como coletamos, 
            processamos e protegemos suas informações de identificação e atividade ao interagir com a plataforma Eikon.ai.
          </p>
        </section>

        <section>
          <h2>2. Coleta de Dados</h2>
          <p>Coletamos e processamos os seguintes tipos de dados de forma estrita para o funcionamento da plataforma:</p>
          <ul>
            <li><strong>Dados de Conta:</strong> Nome, endereço de email, e tokens/senhas de autenticação criptografados;</li>
            <li><strong>Dados de Sessão:</strong> Identificadores e cookies essenciais de validação e privacidade de segurança;</li>
            <li><strong>Dados de Chat:</strong> Históricos de conversação e mensagens processadas por nossos sistemas de linguagem;</li>
            <li><strong>Dados de Navegação:</strong> Registro analítico de interações, páginas visitadas e tempos de resposta do sistema;</li>
            <li><strong>Dados de Dispositivo:</strong> Endereços IP mapeados para auditoria de segurança, tipo de navegador e dados do sistema operacional.</li>
          </ul>
        </section>

        <section>
          <h2>3. Uso de Dados</h2>
          <p>Seus dados são aplicados exclusivamente para:</p>
          <ul>
            <li>Fornecer, sustentar e aprimorar os recursos de processamento da plataforma;</li>
            <li>Assegurar a integridade e proteção das contas e sessões ativas contra acessos maliciosos;</li>
            <li>Processar de forma otimizada as requisições de mensagens enviadas aos nossos modelos de IA;</li>
            <li>Analisar logs gerais de performance operacional do sistema;</li>
            <li>Comunicar atualizações críticas ou alterações em nossas diretrizes legais.</li>
          </ul>
        </section>

        <section>
          <h2>4. Cookies e Identificadores Locais</h2>
          <p>
            Utilizamos identificadores divididos em duas categorias claras: <strong>essenciais</strong> (mecanismos nativos estritamente necessários para manter você autenticado e proteger as requisições contra ataques Cross-Site) e <strong>analíticos</strong> (dados de navegação opcionais e anônimos). Você pode revisar e ajustar essas permissões a qualquer momento através das preferências do seu navegador.
          </p>
        </section>

        <section>
          <h2>5. Compartilhamento de Informações</h2>
          <p>
            A Eikon.ai adota uma política rigorosa de não comercialização de dados. Seus dados pessoais não são transferidos para terceiros, exceto sob as seguintes condições restritas:
          </p>
          <ul>
            <li>Provedores de infraestrutura técnica (banco de dados e hospedagem de servidores) operando sob contratos rígidos de confidencialidade;</li>
            <li>Cumprimento estrito de obrigações ou requisições legais emitidas por autoridades competentes;</li>
            <li>Casos explícitos de auditoria de segurança para resguardar a integridade física ou digital da plataforma.</li>
          </ul>
        </section>

        <section>
          <h2>6. Infraestrutura de Segurança</h2>
          <p>
            Implementamos camadas contínuas de proteção cibernética. Todas as conexões utilizam criptografia de transporte TLS/HTTPS, armazenamento seguro de sessões através de cookies configurados como HTTP-only (evitando interceptações via scripts maliciosos de terceiros) e estratégias validadas de prevenção contra CSRF.
          </p>
        </section>

        <section>
          <h2>7. Período de Retenção de Dados</h2>
          <p>
            As sessões de conversação e dados vinculados à conta permanecem armazenados unicamente enquanto o seu cadastro constar ativo na plataforma. Caso você decida solicitar o encerramento definitivo da sua conta, os dados pessoais e históricos associados serão completamente purgados do nosso banco de dados em até 30 dias.
          </p>
        </section>

        <section>
          <h2>8. Direitos do Usuário</h2>
          <p>Garantimos controle total sobre os seus dados, assegurando o direito de:</p>
          <ul>
            <li>Confirmar e visualizar a existência do processamento de seus dados pessoais;</li>
            <li>Corrigir registros que porventura estejam desatualizados ou incompletos;</li>
            <li>Requerer a eliminação permanente e total de suas informações de identificação;</li>
            <li>Revogar consentimentos concedidos anteriormente com efeito imediato.</li>
          </ul>
        </section>

        {/* Última atualização e Rodapé juntos lá embaixo igual ao Terms */}
        <footer className={styles.footer}>
          <p className={styles.lastUpdated}>Última atualização: 19 de junho de 2026</p>
          <p>© {new Date().getFullYear()} Eikon.ai — Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPage;