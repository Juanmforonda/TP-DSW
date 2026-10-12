import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminDashboard, AdminPerfilPage, AdminPanel } from './pages/admin/adminPanel.jsx';
import Login from './pages/Login';
import {
  SocioAlquileresPage,
  SocioCuotasPage,
  SocioDashboard,
  SocioEmbarcacionesPage,
  SocioPanel,
  SocioPerfilPage,
  SocioReservasEmbarcacionPage,
  SocioReservasTravelLiftPage,
} from './pages/socio/socioPanel.jsx';
import Home from './pages/landing/Home';
import About from './pages/landing/About';
import Testimonials from './pages/landing/Testimonials';
import Contact from './pages/landing/Contact';
import { PagoResultado } from './pages/PagoResultado.jsx';
import { MenuAdminSocios } from './pages/admin/MenuAdminSocios.jsx';
import { MenuAdminAmarras } from './pages/admin/MenuAdminAmarras.jsx';
import { MenuAdminBox } from './pages/admin/MenuAdminBox.jsx';
import { MenuAdminEmbarcaciones } from './pages/admin/MenuAdminEmbarcaciones.jsx';
import AdministrarSocios from './pages/admin/AdministrarSocios.jsx';
import AdministrarAmarras from './pages/admin/AdministrarAmarras.jsx';
import AdministrarBoxes from './pages/admin/AdministrarBoxes.jsx';
import { AdministrarCuotas } from './pages/admin/AdministrarCuotas.jsx';
import { AdministrarAfiliaciones } from './pages/admin/AdministrarAfiliaciones.jsx';
import { AdministrarReservasEmbarcacionClub } from './pages/admin/AdministrarReservasEmbarcacionClub.jsx';
import AdministrarEmbarcacionesSocios from './pages/admin/AdministrarEmbarcacionesSocios.jsx';
import IngresarEmbarcaciones from './pages/admin/IngresarEmbarcaciones.jsx';
import AdministrarTiposEmbarcacion from './pages/admin/AdministrarTiposEmbarcacion.jsx';
import { AdministrarReservasTravelLift } from './pages/admin/AdministrarReservasTravelLift.jsx';
import ListarAmarras from './pages/admin/ListarAmarras.jsx';
import ListarBoxes from './pages/admin/ListarBoxes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminPanel />}>
          <Route index element={<AdminDashboard />} />
          <Route path="perfil" element={<AdminPerfilPage />} />
          <Route path="socios" element={<MenuAdminSocios />} />
          <Route path="socios/administrar" element={<AdministrarSocios />} />
          <Route path="socios/cuotas" element={<AdministrarCuotas />} />
          <Route path="socios/afiliaciones" element={<AdministrarAfiliaciones />} />
          <Route path="embarcaciones" element={<MenuAdminEmbarcaciones />} />
          <Route path="embarcaciones/listado" element={<AdministrarEmbarcacionesSocios />} />
          <Route path="embarcaciones/ingresar" element={<IngresarEmbarcaciones />} />
          <Route path="embarcaciones/tipos" element={<AdministrarTiposEmbarcacion />} />
          <Route path="amarras" element={<MenuAdminAmarras />} />
          <Route path="amarras/administrar" element={<AdministrarAmarras />} />
          <Route path="amarras/listar" element={<ListarAmarras />} />
          <Route path="boxes" element={<MenuAdminBox />} />
          <Route path="boxes/administrar" element={<AdministrarBoxes />} />
          <Route path="boxes/listar" element={<ListarBoxes />} />
          <Route path="reservas/embarcacion-club" element={<AdministrarReservasEmbarcacionClub />} />
          <Route path="reservas/travel-lift" element={<AdministrarReservasTravelLift />} />
        </Route>

        <Route path="/socio" element={<SocioPanel />}>
          <Route index element={<SocioDashboard />} />
          <Route path="perfil" element={<SocioPerfilPage />} />
          <Route path="embarcaciones" element={<SocioEmbarcacionesPage />} />
          <Route path="cuotas" element={<SocioCuotasPage />} />
          <Route path="amarras" element={<SocioAlquileresPage />} />
          <Route path="reservas/embarcacion-club" element={<SocioReservasEmbarcacionPage />} />
          <Route path="reservas/travel-lift" element={<SocioReservasTravelLiftPage />} />
        </Route>

        <Route path="/pago/exito" element={<PagoResultado tipo="exito" />} />
        <Route path="/pago/pendiente" element={<PagoResultado tipo="pendiente" />} />
        <Route path="/pago/error" element={<PagoResultado tipo="error" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
