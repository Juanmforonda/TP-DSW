import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CNavbarNav,
  CNavItem,
  CNavLink,
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
      <CNavbar
        colorScheme="dark"
        className="bg-primary px-3 dashboard-navbar"
        expand="lg"
        fixed="top"
      >
        <CContainer
          fluid
          className="d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
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

            <CNavbarNav
              id="socio-navigation"
              className={`dashboard-nav ${open ? 'is-open' : ''}`}
            >
              {navItems.map((item) => (
                <CNavItem key={item.key}>
                  <CNavLink
                    as={NavLink}
                    to={`/socio/${item.key}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNavbarNav>
          </div>

          <CButton
            color="light"
            variant="outline"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </CButton>
        </CContainer>
      </CNavbar>
    </>
  );
}
