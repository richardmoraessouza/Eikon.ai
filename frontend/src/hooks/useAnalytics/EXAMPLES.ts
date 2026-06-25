/**
 * Exemplo de uso do useAnalytics Hook para rastrear eventos customizados
 * 
 * Este arquivo demonstra como integrar tracking de eventos em componentes
 */

import { useAnalytics } from './useAnalytics';

/**
 * EXEMPLO 1: Rastrear evento de clique em botão
 */
export function ExemploButtonClick() {
  const { trackEvent } = useAnalytics();

  const handleButtonClick = () => {
    // Seu código aqui...

    // Rastrear o evento no GA4
    trackEvent('button_click', {
      button_name: 'signup_button',
      section: 'hero',
    });
  };

  return <button onClick={handleButtonClick}>Inscrever-se</button>;
}

/**
 * EXEMPLO 2: Rastrear visualização de formulário
 */
export function ExemploFormView() {
  const { trackEvent } = useAnalytics();

  const handleFormStart = () => {
    trackEvent('form_start', {
      form_name: 'user_registration',
      form_id: 'form_001',
    });
  };

  return <form onSubmit={handleFormStart}>{/* form fields */}</form>;
}

/**
 * EXEMPLO 3: Rastrear conclusão de ação
 */
export function ExemploCheckout() {
  const { trackEvent } = useAnalytics();

  const handleCheckout = async (items, total) => {
    // Processar checkout...

    // Rastrear compra
    trackEvent('purchase', {
      transaction_id: '12345',
      value: total,
      currency: 'BRL',
      items: items.length.toString(),
    });
  };

  return (
    <button onClick={() => handleCheckout([], 99.99)}>
      Confirmar Compra
    </button>
  );
}

/**
 * EXEMPLO 4: Rastrear scroll (evento customizado)
 */
export function ExemploScroll() {
  const { trackEvent } = useAnalytics();

  const handleScroll = (e) => {
    const scrollPercentage = Math.round(
      (e.target.scrollLeft / e.target.scrollWidth) * 100
    );

    if (scrollPercentage % 25 === 0) {
      trackEvent('page_scroll', {
        scroll_percentage: scrollPercentage.toString(),
      });
    }
  };

  return <div onScroll={handleScroll}>{/* scrollable content */}</div>;
}

/**
 * LISTA DE EVENTOS RECOMENDADOS PARA GA4
 *
 * Google Analytics 4 tem eventos recomendados (recommended events) que
 * têm análise especial. Aqui estão os mais importantes:
 *
 * 1. page_view
 *    - Rastreado automaticamente
 *    - Quando página muda
 *
 * 2. scroll
 *    - Quando usuário scrolleia 90% da página
 *    - trackEvent('scroll', { percent_scrolled: '90' })
 *
 * 3. click
 *    - Quando usuário clica em elemento
 *    - trackEvent('click', { element_name: 'button_name' })
 *
 * 4. form_start
 *    - Quando usuário começa preencher um formulário
 *    - trackEvent('form_start', { form_name: 'signup' })
 *
 * 5. form_submit
 *    - Quando usuário submete um formulário
 *    - trackEvent('form_submit', { form_name: 'signup' })
 *
 * 6. purchase
 *    - Quando usuário faz uma compra
 *    - trackEvent('purchase', { value: 99.99, currency: 'BRL' })
 *
 * 7. view_item
 *    - Quando usuário visualiza um produto/artigo
 *    - trackEvent('view_item', { item_id: '123', item_name: 'Produto' })
 *
 * 8. add_to_cart
 *    - Quando usuário adiciona item ao carrinho
 *    - trackEvent('add_to_cart', { item_id: '123', value: 99.99 })
 *
 * 9. login
 *    - Quando usuário faz login
 *    - trackEvent('login', { method: 'google' })
 *
 * 10. sign_up
 *     - Quando usuário se inscreve
 *     - trackEvent('sign_up', { method: 'email' })
 *
 * Para eventos customizados, você pode usar qualquer nome que desejar!
 */

/**
 * GUIA DE MELHORES PRÁTICAS
 *
 * 1. Não rastreie dados pessoais
 *    ❌ trackEvent('user_email', { email: 'user@example.com' })
 *    ✅ trackEvent('email_verified', { success: true })
 *
 * 2. Use snake_case para nomes de eventos e parâmetros
 *    ❌ trackEvent('buttonClicked', { buttonName: 'SignUp' })
 *    ✅ trackEvent('button_clicked', { button_name: 'sign_up' })
 *
 * 3. Limite a quantidade de parâmetros por evento
 *    ❌ Mais de 25 parâmetros por evento
 *    ✅ Máximo 25 parâmetros por evento
 *
 * 4. Use valores consistentes para parâmetros
 *    ❌ trackEvent('page_view', { page: 'Product_123' || 'product_456' })
 *    ✅ trackEvent('page_view', { page_type: 'product' })
 *
 * 5. Rastreie apenas o necessário
 *    ❌ Rastrear TODA interação
 *    ✅ Rastrear apenas ações importantes para o negócio
 */

/**
 * COMO USAR NO APP.TSX
 *
 * import useAnalytics from './hooks/useAnalytics/useAnalytics';
 *
 * function MyComponent() {
 *   const { trackEvent, isInitialized } = useAnalytics();
 *
 *   const handleClick = () => {
 *     if (isInitialized) {
 *       trackEvent('custom_event', {
 *         event_param: 'value',
 *       });
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Clique aqui</button>;
 * }
 */
