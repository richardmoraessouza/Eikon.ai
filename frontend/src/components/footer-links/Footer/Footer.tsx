import React from 'react';
import Link from 'next/link'; // Roteador otimizado do Next.js
import styles from './Footer.module.css';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const sections: FooterSection[] = [
    {
      title: 'Plataforma',
      links: [
        { label: 'Explorar Personagens', href: '/' }, // Rota raiz (Sua home de explore)
        { label: 'Criar Personagem', href: '/create-character' },
      ],
    },
    {
      title: 'Segurança & Jurídico',
      links: [
        { label: 'Termos de Serviço', href: '/terms' }, // Aponta para app/terms/page.tsx
        { label: 'Política de Privacidade', href: '/privacy' }, // Aponta para app/privacy/page.tsx
        { label: 'Diretrizes de Segurança', href: '/safety' }, // Aponta para app/safety/page.tsx
      ],
    },
    {
      title: 'Sobre',
      links: [
        { label: 'Sobre o Projeto Eikon.ai', href: '/about' }, // Aponta para app/about/page.tsx
        { label: 'Central de Ajuda', href: '/help' }, // Aponta para app/help/page.tsx
        { label: 'Feedback / Sugestões', href: '/feedback' }, // Aponta para app/feedback/page.tsx
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Seções de Links */}
        <div className={styles.linksWrapper}>
          {sections.map((section) => (
            <div key={section.title} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <ul className={styles.linksList}>
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={styles.link}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            <p>
              © {currentYear} <strong>Eikon.ai</strong>. Todos os direitos reservados.
            </p>
          </div>
          <div className={styles.socialLinks}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="Twitter"
            >
              <span>𝕏</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="GitHub"
            >
              <span>⚙️</span>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              title="Discord"
            >
              <span>💬</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;