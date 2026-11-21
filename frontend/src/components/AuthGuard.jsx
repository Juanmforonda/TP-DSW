import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthenticatedProfile } from '../api/auth';
import { clearSession } from '../utils/storage';

export function AuthGuard({ role }) {
  const token = localStorage.getItem('token');
  const [checking, setChecking] = useState(Boolean(token));
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!token) {
      clearSession();
      setChecking(false);
      return;
    }

    let activo = true;
    getAuthenticatedProfile()
      .then((res) => {
        if (!activo) return;
        const tipo = res.data?.data?.tipo;
        setAllowed(!role || tipo === role);
      })
      .catch(() => {
        if (!activo) return;
        clearSession();
        setAllowed(false);
      })
      .finally(() => {
        if (activo) setChecking(false);
      });

    return () => {
      activo = false;
    };
  }, [role, token]);

  if (!token) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  if (checking) return null;
  if (!allowed) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
