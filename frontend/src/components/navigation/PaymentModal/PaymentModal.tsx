'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme/useTheme';
import styles from './PaymentModal.module.css';

interface PremiumModalProps {
  currentTab?: string;
  onClose?: () => void;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7.2L5.2 10.4L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.8 1L3 9.4H7.2L6.4 15L13 6.2H8.6L8.8 1Z" fill="currentColor" />
  </svg>
);

export default function PremiumModal({ currentTab = 'anual', onClose }: PremiumModalProps) {
  useTheme();

  const opcoes = [
    {
      id: 'mensal',
      nome: 'Pagamento mensal',
      descricao: 'Cobrado todo mês, cancele quando quiser',
      preco: '154.90',
      sufixo: '/mês',
      nota: 'Cobrado mensalmente',
      cta: 'Assinar mensal',
      tab: 'mensal',
    },
    {
      id: 'anual',
      nome: 'Pagamento anual',
      descricao: 'Pague o ano todo de uma vez e economize',
      preco: '85.17',
      sufixo: '/mês',
      nota: 'R$ 1.022,04 cobrado uma vez por ano',
      desconto: '-45%',
      cta: 'Assinar o ano todo',
      tab: 'anual',
      destaque: true,
    },
  ];

  const features = [
    'Criação em lote com mais rapidez',
    'Modo de alta qualidade ativado',
    'Liberação de recursos premium',
    '+1.8K de créditos por dia',
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 ${styles.overlay}`}>
      <div className={`relative w-full max-w-3xl overflow-hidden rounded-[28px] border shadow-2xl ${styles.modalShell}`}>
        <button
          type="button"
          onClick={onClose}
          className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${styles.closeButton}`}
          aria-label="Fechar modal de planos"
        >
          ✕
        </button>

        <div className={`relative overflow-hidden border-b px-6 py-9 text-center md:px-10 md:py-11 ${styles.hero}`}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <span className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${styles.heroBadge}`}>
            <BoltIcon /> Eikon.ai Premium
          </span>
          <h2 className={`relative mt-5 text-[26px] font-black leading-[1.1] tracking-tight md:text-3xl ${styles.heroTitle}`}>
            Mais potência para criar,
            <br className="hidden md:block" /> testar e evoluir personagens
          </h2>
          <p className={`relative mx-auto mt-3 max-w-xl text-sm md:text-[15px] ${styles.heroText}`}>
            Escolha como prefere pagar. O acesso e os recursos são exatamente os mesmos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 md:p-8">
          {opcoes.map((opcao) => (
            <div
              key={opcao.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${opcao.destaque ? styles.planCardHighlight : styles.planCard}`}
            >
              {opcao.destaque && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${styles.planTag}`}>
                  Melhor valor
                </span>
              )}

              <div>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className={`text-base font-bold tracking-tight ${styles.planTitle}`}>{opcao.nome}</h3>
                  {opcao.desconto && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${styles.planDiscount}`}>{opcao.desconto}</span>
                  )}
                </div>
                <p className={`mb-4 text-xs ${styles.heroText}`}>{opcao.descricao}</p>

                <div className="mb-2 flex items-baseline gap-1">
                  <span className={`text-sm font-bold ${styles.priceLabel}`}>R$</span>
                  <span className={`text-[38px] font-black leading-none tracking-tight ${styles.priceValue}`}>
                    {opcao.preco}
                  </span>
                  <span className={`text-xs ${styles.priceSuffix}`}>{opcao.sufixo}</span>
                </div>
                <p className={`mb-5 text-[11px] font-medium ${styles.powerLabel}`}>{opcao.nota}</p>
              </div>

              <div className={`mb-6 space-y-2.5 border-t pt-4 text-xs ${styles.featuresList}`}>
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <span className={styles.featureIcon}><CheckIcon /></span>
                    <p>{feature}</p>
                  </div>
                ))}
              </div>

              <Link
                href={`?checkout=true&tab=${opcao.tab}`}
                className={`w-full rounded-xl px-4 py-3 text-center text-xs font-black uppercase tracking-[0.16em] transition-all ${opcao.destaque ? styles.buttonPrimary : styles.buttonSecondary}`}
              >
                {opcao.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}