import axios from 'axios';

/**
 * Configura interceptores globais do axios
 * Adiciona automaticamente o token em todas as requisições
 */
export function setupAxiosInterceptors() {
  // Interceptor de request - adiciona token automaticamente
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Remove "Bearer " se já estiver no token (evita duplication)
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
        
        if (cleanToken && cleanToken.includes('.')) {
          // Log de debug apenas para URLs que requerem autenticação
          
          
          config.headers.Authorization = `Bearer ${cleanToken}`;
        } else {
          console.warn('[Axios] Token inválido encontrado:', {
            hasToken: !!token,
            isJWT: token?.includes('.'),
            length: token?.length
          });
        }
      } else {
        // console.warn('[Axios] Nenhum token encontrado para:', config.url);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de response - trata erros 401
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('[Axios] ⚠️ Erro 401 - Sessão expirada ou token inválido');
        console.error('[Axios] URL que falhou:', error.config?.url);
        console.error('[Axios] Resposta do servidor:', error.response?.data);
        
        // Limpa dados de autenticação
        localStorage.clear();
        
        // Redireciona para login (se estiver no navegador)
        if (typeof window !== 'undefined' && window.location.pathname !== '/entrar') {
          console.log('[Axios] Redirecionando para login...');
          window.location.href = '/entrar';
        }
      }
      
      return Promise.reject(error);
    }
  );
}
