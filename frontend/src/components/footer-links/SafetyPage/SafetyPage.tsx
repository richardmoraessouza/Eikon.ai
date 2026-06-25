'use client'; // Necessário no Next.js (App Router) devido ao uso do hook useRouter e eventos de clique

import React from 'react';
import { useRouter } from 'next/navigation'; // Substitui o useNavigate do react-router-dom
import styles from './SafetyPage.module.css';

const SafetyPage: React.FC = () => {
  const router = useRouter(); // Instanciando o roteador do Next.js

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Botão de voltar padronizado com o título da página */}
        <div 
          className={styles.backButton} 
          onClick={() => router.back()} // router.back() substitui perfeitamente o navigate(-1)
          role="button"
          tabIndex={0}
        >
          <span>‹</span> Diretrizes de Segurança da Eikon.ai
        </div>

        <h1>Diretrizes de Segurança</h1>
        
        <section>
          <h2>1. Segurança de Conta</h2>
          <p>Para manter sua conta protegida contra acessos maliciosos:</p>
          <ul>
            <li>Use uma senha forte e exclusiva que não seja reaproveitada em outros sites;</li>
            <li>Não compartilhe suas credenciais com ninguém, inclusive membros da equipe Eikon.ai;</li>
            <li>Mantenha o logout de sua conta ativo ao utilizar computadores públicos ou compartilhados;</li>
            <li>Notifique-nos imediatamente caso identifique qualquer comportamento ou acesso suspeito.</li>
          </ul>
        </section>

        <section>
          <h2>2. Dados Sensíveis</h2>
          <p>
            Nunca compartilhe as seguintes informações privadas no ambiente de chat com os personagens de IA:
          </p>
          <ul>
            <li>Senhas, chaves de criptografia ou tokens de segurança;</li>
            <li>Números de cartão de crédito, dados bancários ou informações financeiras;</li>
            <li>Documentos de identificação pessoal (CPF, RG, passaporte);</li>
            <li>Dados sensíveis de saúde ou prontuários médicos;</li>
            <li>Endereços residenciais exatos ou números de contato pessoal.</li>
          </ul>
        </section>

        <section>
          <h2>3. Conteúdo Apropriado</h2>
          <p>
            Eikon.ai visa sustentar um ecossistema saudável e criativo para todos os usuários. Evite enviar ou induzir:
          </p>
          <ul>
            <li>Conteúdo sexualmente explícito, pornográfico ou obsceno;</li>
            <li>Imagens ou descrições violentas, de automutilação ou gore;</li>
            <li>Discursos de ódio, assédio, injúria ou qualquer teor discriminatório;</li>
            <li>Ameaças diretas, bullying ou perseguição de indivíduos;</li>
            <li>Ações que promovam, facilitem ou instruam atividades ilegais.</li>
          </ul>
        </section>

        <section>
          <h2>4. Privacidade de Terceiros</h2>
          <p>
            Respeite a integridade e privacidade de outras pessoas na plataforma:
          </p>
          <ul>
            <li>Não expose dados pessoais ou registros de terceiros sem consentimento prévio e explícito;</li>
            <li>Não utilize engenharia reversa ou scripts automatizados para extrair conteúdos protegidos;</li>
            <li>Respeite as interações e a propriedade intelectual da comunidade.</li>
          </ul>
        </section>

        <section>
          <h2>5. Proteção Contra Phishing</h2>
          <p>
            Evite golpes e roubo de identidade prestando atenção aos canais oficiais:
          </p>
          <ul>
            <li>Certifique-se de que está acessando o domínio oficial da Eikon.ai na sua barra de endereços;</li>
            <li>Verifique a presença do certificado SSL/HTTPS ativo (o ícone de cadeado do navegador);</li>
            <li>Lembre-se de que a equipe Eikon.ai nunca solicitará sua senha secreta via e-mail ou chat de suporte.</li>
          </ul>
        </section>

        <section>
          <h2>6. Integridade do Dispositivo</h2>
          <p>
            Proteja o hardware e software que você utiliza para navegar:
          </p>
          <ul>
            <li>Mantenha seu navegador web e sistema operacional atualizados com os últimos patches de segurança;</li>
            <li>Evite o download de extensões ou arquivos suspeitos vindos de fontes não verificadas;</li>
            <li>Utilize conexões de rede seguras e evite transferir dados sensíveis em redes Wi-Fi públicas abertas.</li>
          </ul>
        </section>

        <section>
          <h2>7. Reporte de Vulnerabilidades</h2>
          <p>
            Se você for um desenvolvedor ou entusiasta de segurança e descobrir uma falha no sistema:
          </p>
          <ul>
            <li>Não divulgue a vulnerabilidade publicamente antes da nossa correção;</li>
            <li>Envie um relatório detalhado com os passos para reprodução através dos nossos canais de contato;</li>
            <li>Trabalharemos juntos sob uma política de divulgação responsável para aplicar as correções o quanto antes.</li>
          </ul>
        </section>

        {/* Rodapé e última atualização unificados embaixo */}
        <footer className={styles.footer}>
          <p className={styles.lastUpdated}>Última atualização: 19 de junho de 2026</p>
          <p>© {new Date().getFullYear()} Eikon.ai — Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default SafetyPage;