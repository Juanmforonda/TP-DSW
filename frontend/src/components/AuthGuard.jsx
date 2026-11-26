import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthenticatedProfile } from '../api/auth';
import { clearSession } from '../utils/storage';

export function AuthGuard({ role }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState(null);

  useEffect(() => {
    let activo = true;
    getAuthenticatedProfile()
      .then((res) => {
        if (!activo) return;
        const tipo = res.data?.data?.tipo;
        setAuthenticatedRole(tipo);
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
  }, [role]);

  if (checking) return null;
  if (!allowed) {
    if (authenticatedRole === 'admin') return <Navigate to="/admin" replace />;
    if (authenticatedRole === 'socio') return <Navigate to="/socio" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
