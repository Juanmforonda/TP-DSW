import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { CContainer } from '@coreui/react';
import { AdminNavbar } from '../../components/AdminNavbar.jsx';
import AdminHome from './AdminHome.jsx';
import { AdminPerfil } from './AdminPerfil.jsx';

export function AdminPanel() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const adminGuardado = localStorage.getItem('admin');
    if (!adminGuardado) return;

    try {
      setAdmin(JSON.parse(adminGuardado));
    } catch (error) {
      console.error('Error al parsear admin:', error);
    }
  }, []);

  return (
    <>
      <AdminNavbar />
      <CContainer style={{ marginTop: '70px' }}>
        <Outlet context={{ admin }} />
      </CContainer>
    </>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();

  const handleSeleccion = (path) => {
    navigate(path.startsWith('/') ? path : `/admin/${path}`);
  };

  return <AdminHome onSeleccion={handleSeleccion} />;
}

export function AdminPerfilPage() {
  const { admin } = useOutletContext();
  return admin ? <AdminPerfil idAdmin={admin.id} /> : null;
}
