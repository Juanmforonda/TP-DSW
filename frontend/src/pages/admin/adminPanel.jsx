import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { CContainer } from '@coreui/react';
import { AdminNavbar } from '../../components/AdminNavbar.jsx';
import AdminHome from './AdminHome.jsx';
import { AdminPerfil } from './AdminPerfil.jsx';
import { getMiPerfilAdministrador } from '../../api/administradores';

export function AdminPanel() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let activo = true;
    getMiPerfilAdministrador()
      .then((res) => {
        if (activo) setAdmin(res.data?.data);
      })
      .catch((error) => {
        console.error('Error al cargar el perfil del administrador:', error);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <>
      <AdminNavbar />
      <CContainer className="dashboard-page-content">
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
  return <AdminPerfil />;
}
