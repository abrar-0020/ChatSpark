import axios from 'axios';

const LOCAL_API_URL = 'http://localhost:5000/api';
const PROD_API_URL = 'https://chatspark.onrender.com/api';

const resolveApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL as string | undefined;
  const isLocalHost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

  if (import.meta.env.DEV || isLocalHost) {
    return configuredUrl || LOCAL_API_URL;
  }

  if (configuredUrl && !/localhost|127\.0\.0\.1/.test(configuredUrl)) {
    return configuredUrl;
  }

  return PROD_API_URL;
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
