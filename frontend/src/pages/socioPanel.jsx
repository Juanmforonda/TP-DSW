import React, { useState, useEffect } from 'react';
import { SocioNavbar } from '../components/SocioNavbar.jsx';
import SocioHome from '../components/SocioHome.jsx';
import {SocioEmbarcaciones} from '../components/SocioEmbarcaciones.jsx';
import { SocioCuotas } from '../components/SocioCuotas.jsx';
import { SocioPerfil } from '../components/SocioPerfil.jsx';
import { SocioReservasEmbarcacion } from './SocioReservasEmbarcacion.jsx';
import {SocioHome2} from '../components/SocioHome2.jsx';
import { SocioAfiliaciones } from './SocioAfiliaciones.tsx';
import { SocioAlquileres } from '../components/SocioAlquileres.jsx';

export function SocioPanel() {
  const [pagina, setPagina] = useState(null);
  const [socio, setSocio] = useState(null);

console.log('🔍 Render condicional: pagina =', pagina, ', socio =', socio);

useEffect(() => {
  const socioGuardado = localStorage.getItem('socio');
  if (socioGuardado) {
    try {
      const socioObj = JSON.parse(socioGuardado);
      console.log('✅ Socio cargado desde localStorage:', socioObj);
      setSocio(socioObj);
    } catch (e) {
      console.error('❌ Error al parsear socio:', e);
    }
  } else {
    console.warn('⚠️ No hay socio en localStorage');
  }
}, []);

  function handleSeleccion(pagina) {
    setPagina(pagina);
  }

  return (
    <>
        <SocioNavbar onSeleccion={handleSeleccion} paginaActual={pagina} socio={socio} />
        {pagina === null && socio && (
        <SocioHome2  onSeleccion={setPagina} />
        )}
        {pagina === 'perfil' && socio && (
         <SocioPerfil  idSocio={socio.id} />
        )}
        {pagina === 'embarcaciones' && socio && (
         <SocioEmbarcaciones idSocio={socio.id} />
        )}
        {pagina === 'cuotas' && socio && (
         <SocioCuotas idSocio={socio.id} />
        )}
        {pagina === 'amarras' && (
         <SocioAlquileres idSocio={socio.id} />
        )}
        {pagina === 'reservasEmbarcacionClub' && socio && (
          <SocioReservasEmbarcacion idSocio={socio.id} />
        
        )}
        {pagina === 'afiliaciones' && socio && (
          <SocioAfiliaciones idSocio={socio.id} />
        )}
    </>
  );
}