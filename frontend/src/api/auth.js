import api from './client';

export const getAuthenticatedProfile = () =>
  api.get('/api/auth/me');
