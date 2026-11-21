import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { getMiPerfil } from '../../api/socios';
import { SocioNavbar } from '../../components/SocioNavbar.jsx';
import { SocioHome2 } from './SocioHome2.jsx';
import { SocioEmbarcaciones } from './SocioEmbarcaciones.jsx';
import { SocioCuotas } from './SocioCuotas.jsx';
import { SocioPerfil } from './SocioPerfil.jsx';
import { SocioAlquileres } from './SocioAlquileres.jsx';
import { SocioReservasEmbarcacion } from './SocioReservasEmbarcacion.jsx';
import { SocioReservasTravelLift } from './SocioReservasTravelLift.jsx';
import '../../components/DashboardNavbar.css';

export function SocioPanel() {
  const [socio, setSocio] = useState(null);

  useEffect(() => {
    let activo = true;
    getMiPerfil()
      .then((res) => {
        if (activo) setSocio(res.data?.data?.perfil ?? res.data?.data);
      })
      .catch((error) => {
        console.error('Error al cargar el perfil del socio:', error);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <>
      <SocioNavbar socio={socio} />
      <main className="socio-page-content">
        <Outlet context={{ socio }} />
      </main>
    </>
  );
}

function useSocioRoute() {
  return useOutletContext();
}

export function SocioDashboard() {
  const { socio } = useSocioRoute();
  const navigate = useNavigate();

  const handleSeleccion = (path) => {
    navigate(`/socio/${path}`);
  };

  return socio ? <SocioHome2 onSeleccion={handleSeleccion} /> : null;
}

export function SocioPerfilPage() {
  return <SocioPerfil />;
}

export function SocioEmbarcacionesPage() {
  return <SocioEmbarcaciones />;
}

export function SocioCuotasPage() {
  return <SocioCuotas />;
}

export function SocioAlquileresPage() {
  return <SocioAlquileres />;
}

export function SocioReservasEmbarcacionPage() {
  return <SocioReservasEmbarcacion />;
}

export function SocioReservasTravelLiftPage() {
  return <SocioReservasTravelLift />;
}
