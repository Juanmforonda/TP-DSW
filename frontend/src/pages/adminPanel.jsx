import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../components/AdminNavbar.jsx';
import { CContainer } from '@coreui/react';
import { MenuAdminSocios } from '../components/MenuAdminSocios.jsx';
import { MenuAdminAmarras } from '../components/MenuAdminAmarras.jsx';
import { MenuAdminBox } from '../components/MenuAdminBox.jsx';
import AdministrarSocios from './AdministrarSocios.jsx';
import AdministrarAmarras from './AdministrarAmarras.jsx';
import AdministrarBoxes from './AdministrarBoxes.jsx';
import AdminHome from '../components/AdminHome.jsx';
import { AdministrarCuotas } from './AdministrarCuotas.jsx'
import { AdministrarAfiliaciones} from './AdministrarAfiliaciones.jsx'
import { AdminPerfil } from '../components/AdminPerfil.jsx';
import { AdministrarReservasEmbarcacionClub } from './AdministrarReservasEmbarcacionClub.jsx';
import ListarAmarras from './ListarAmarras.jsx';
import ListarBoxes from './ListarBoxes.jsx';
import AdministrarEmbarcacionesSocios from './AdministrarEmbarcacionesSocios.jsx';
import { MenuAdminEmbarcaciones } from '../components/MenuAdminEmbarcaciones.jsx';
import AdministrarTiposEmbarcacion from './AdministrarTiposEmbarcacion.jsx';
import { AdministrarReservasTravelLift } from './AdministrarReservasTravelLift.jsx';

// importá otros componentes cuando los tengas

export function AdminPanel() {
  const [pagina, setPagina] = useState(null);
  const [admin, setAdmin] = useState(null);

console.log('🔍 Render condicional: pagina =', pagina, ', admin =', admin);

  useEffect(() => {
    const adminGuardado = localStorage.getItem('admin');
    if (adminGuardado) {
      try {
        const adminObj = JSON.parse(adminGuardado);
        console.log('✅ Admin cargado desde localStorage:', adminObj);
        setAdmin(adminObj);
      } catch (e) {
        console.error('❌ Error al parsear admin:', e);
      }
    } else {
      console.warn('⚠️ No hay Admin en localStorage');
    }
  }, []);


  function handleSeleccion(pagina) {
    setPagina(pagina);
  }

  return (
    <>
      <AdminNavbar onSeleccion={handleSeleccion} paginaActual={pagina} />
      {!pagina && <AdminHome onSeleccion={handleSeleccion} />}
      <CContainer style={{ marginTop: '70px' }}>
        {pagina === 'perfil' && admin && (
        <AdminPerfil  idAdmin={admin.id} />
        )}

        {pagina === 'socios' && (<MenuAdminSocios onSeleccion={handleSeleccion} />)}
        {pagina === 'administrarSocios' && <AdministrarSocios />}
        {pagina === 'administrarCuotas' && <AdministrarCuotas/>}
        {pagina === 'administrarAfiliaciones' && <AdministrarAfiliaciones/>}

        {pagina === 'embarcaciones' && (<MenuAdminEmbarcaciones onSeleccion={handleSeleccion} />)}
        {pagina === 'embarcacionesDeSocios' && <AdministrarEmbarcacionesSocios/>}
        {pagina === 'tiposEmbarcacion' && <AdministrarTiposEmbarcacion/>}

        {pagina === 'amarras' && <MenuAdminAmarras onSeleccion={handleSeleccion}/>}
        {pagina === 'administrarAmarras' && <AdministrarAmarras/>}

        {pagina === 'reservasEmbarcacionClub' && <AdministrarReservasEmbarcacionClub />}
        {pagina === 'reservasTravelLift' && <AdministrarReservasTravelLift />}
        {pagina === 'listarAmarras' && <ListarAmarras/>}

        {pagina === 'boxes' && <MenuAdminBox onSeleccion={handleSeleccion}/>}
        {pagina === 'administrarBoxes' && <AdministrarBoxes/>}
        {pagina === 'listarBoxes' && <ListarBoxes/>}
      </CContainer>
    </>
  );
}
