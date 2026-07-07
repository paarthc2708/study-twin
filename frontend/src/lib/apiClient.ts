import axios from 'axios';
import { supabase } from './supabaseClient';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (requestConfig) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    requestConfig.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : 'network error';
    console.error(
      `[apiClient] ${error.config?.method?.toUpperCase() ?? ''} ${error.config?.url ?? ''} failed (${status}):`,
      error.message,
    );
    return Promise.reject(error);
  },
);
