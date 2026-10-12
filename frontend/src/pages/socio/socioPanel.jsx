import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { SocioNavbar } from '../../components/SocioNavbar.jsx';
import { SocioHome2 } from './SocioHome2.jsx';
import { SocioEmbarcaciones } from './SocioEmbarcaciones.jsx';
import { SocioCuotas } from './SocioCuotas.jsx';
import { SocioPerfil } from './SocioPerfil.jsx';
import { SocioAlquileres } from './SocioAlquileres.jsx';
import { SocioReservasEmbarcacion } from './SocioReservasEmbarcacion.jsx';
import { SocioReservasTravelLift } from './SocioReservasTravelLift.jsx';

export function SocioPanel() {
  const [socio, setSocio] = useState(null);

  useEffect(() => {
    const socioGuardado = localStorage.getItem('socio');
    if (!socioGuardado) return;

    try {
      setSocio(JSON.parse(socioGuardado));
    } catch (error) {
      console.error('Error al parsear socio:', error);
    }
  }, []);

  return (
    <>
      <SocioNavbar socio={socio} />
      <Outlet context={{ socio }} />
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
  const { socio } = useSocioRoute();
  return socio ? <SocioPerfil idSocio={socio.id} /> : null;
}

export function SocioEmbarcacionesPage() {
  const { socio } = useSocioRoute();
  return socio ? <SocioEmbarcaciones idSocio={socio.id} /> : null;
}

export function SocioCuotasPage() {
  const { socio } = useSocioRoute();
  return socio ? <SocioCuotas idSocio={socio.id} /> : null;
}

export function SocioAlquileresPage() {
  const { socio } = useSocioRoute();
  return socio ? <SocioAlquileres idSocio={socio.id} /> : null;
}

export function SocioReservasEmbarcacionPage() {
  const { socio } = useSocioRoute();
  return socio ? <SocioReservasEmbarcacion idSocio={socio.id} /> : null;
}

export function SocioReservasTravelLiftPage() {
  const { socio } = useSocioRoute();
  return socio ? <SocioReservasTravelLift idSocio={socio.id} /> : null;
}
