import axios from 'axios';
import { clearSession } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/',
  withCredentials: true,
});

let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearSession();
      if (window.location.pathname !== '/login' && !redirectingToLogin) {
        redirectingToLogin = true;
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
