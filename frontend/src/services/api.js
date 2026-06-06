import axios from 'axios';

const normalizeToken = (token) => {
  if (!token) return null;
  const cleaned = token.trim();
  if (cleaned === 'null' || cleaned === 'undefined' || cleaned === '') return null;
  return cleaned;
};

export const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = normalizeToken(localStorage.getItem('token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);