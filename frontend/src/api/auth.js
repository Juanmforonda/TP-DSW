import api from './client';
import { clearSession } from '../utils/storage';

export const getAuthenticatedProfile = () =>
  api.get('/api/auth/me');

export async function logout() {
  await api.post('/api/auth/logout');
  clearSession();
}

export const login = (email, password) => {
  return api.post('/api/login', {
    email,
    password,
  });
};
