import api from './client';

export const getAuthenticatedProfile = () =>
  api.get('/api/auth/me');

export const loginUser = (email, password) =>
  api.post('/api/login', {
    email,
    password,
  });
