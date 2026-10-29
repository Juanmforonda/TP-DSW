import { Navigate, Outlet } from 'react-router-dom';

function getTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('tipo');
  localStorage.removeItem('admin');
  localStorage.removeItem('socio');
}

export function AuthGuard({ role }) {
  const token = localStorage.getItem('token');
  const tipo = localStorage.getItem('tipo');
  const payload = token ? getTokenPayload(token) : null;
  const hasValidToken = Boolean(
    payload &&
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now() &&
      payload.tipo === tipo,
  );

  if (!hasValidToken || (role && tipo !== role)) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
