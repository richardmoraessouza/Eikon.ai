const fallbackApiUrl = 'https://api-personia.onrender.com';
const localApiUrl = 'http://localhost:3001';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || fallbackApiUrl;

if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Prioriza o backend local quando o frontend estiver rodando localmente.
  (globalThis as typeof globalThis & { __EIKON_API_URL?: string }).__EIKON_API_URL = localApiUrl;
}
