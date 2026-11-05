import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CButton,
} from '@coreui/react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import './DashboardNavbar.css';

export function SocioNavbar({ socio }) {
  const [open, setOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const navItems = [
    { key: 'perfil', label: 'Perfil' },
    { key: 'embarcaciones', label: 'Embarcaciones' },
    { key: 'amarras', label: 'Amarras/Boxes' },
    { key: 'reservas/embarcacion-club', label: 'Reservas' },
    { key: 'reservas/travel-lift', label: 'Travel Lift' },
    { key: 'cuotas', label: 'Cuotas' },
  ];

  return (
    <>
      {/* Encabezado principal */}
      <CNavbar colorScheme="light" className="px-3 dashboard-navbar socio-navbar" expand="lg" fixed="top">
        <CContainer fluid className="d-flex justify-content-between align-items-center">
          <CNavbarBrand
            as={Link}
            to="/socio"
            className="dashboard-brand socio-brand"
            onClick={() => setOpen(false)}
          >
            {socio ? `${socio.apellido} ${socio.nombre}` : 'Socio'}
          </CNavbarBrand>

          <button
            type="button"
            className="dashboard-menu-toggle"
            aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
            aria-expanded={open}
            aria-controls="socio-navigation"
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <CButton color="light" variant="outline" className="dashboard-logout" onClick={handleLogout}>
            Cerrar sesión
          </CButton>
        </CContainer>
      </CNavbar>

      {/* Barra secundaria integrada */}
      <div className={`dashboard-subnav ${open ? 'is-open' : ''}`} id="socio-navigation">
        <div className="dashboard-subnav-inner">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={`/socio/${item.key}`}
              className="text-decoration-none"
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                backgroundColor: isActive ? '#ffffff22' : 'transparent',
                color: 'white',
                fontWeight: isActive ? 'bold' : 'normal',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
