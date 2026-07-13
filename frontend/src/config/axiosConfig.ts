import axios from 'axios';
import { API_URL } from './api';
import { clearCurrentAuthToken, getCurrentAuthToken } from './authTokenStore';

let csrfTokenPromise: Promise<string | null> | null = null;
let csrfTokenCache: string | null = null;

async function getCsrfToken(): Promise<string | null> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = axios.get(`${API_URL}/csrf-token`, { withCredentials: true })
      .then((response) => {
        const token = response?.data?.csrfToken ?? null;
        csrfTokenCache = token;
        return token;
      })
      .catch(() => null);
  }

  return csrfTokenPromise;
}

/**
 * Configura interceptores globais do axios.
 * O token agora é mantido em memória e as requisições usam cookies HttpOnly + CSRF token.
 */
export function setupAxiosInterceptors() {
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use(
    async (config) => {
      config.withCredentials = true;

      const cleanToken = getCurrentAuthToken();
      if (cleanToken) {
        const isValidJwtShape = cleanToken.length > 0 && cleanToken.includes('.');
        if (isValidJwtShape) {
          config.headers.Authorization = `Bearer ${cleanToken}`;
        } else {
          console.warn('[Axios] Token presente porém em formato inválido; requisição seguirá sem Authorization.');
        }
      }

      if (typeof window !== 'undefined' && !config.url?.includes('/csrf-token') && ['post', 'put', 'patch', 'delete'].includes((config.method || 'get').toLowerCase())) {
        const token = await getCsrfToken();
        if (token) {
          config.headers['X-CSRF-Token'] = token;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('[Axios] Sessão expirada ou token inválido. Limpando sessão local.');
        clearCurrentAuthToken();
        csrfTokenCache = null;
        csrfTokenPromise = null;

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
}