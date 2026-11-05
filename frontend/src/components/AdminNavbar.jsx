import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CNavbarNav,
  CNavItem,
  CNavLink,
  CButton,
} from '@coreui/react';
import './DashboardNavbar.css';

export function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <CNavbar colorScheme="dark" className="bg-primary px-3 dashboard-navbar" expand="lg" fixed="top">
      <CContainer fluid className="d-flex justify-content-between align-items-center">
        {/* Izquierda: brand + navegación */}
        <div className="d-flex align-items-center">
          <CNavbarBrand as={Link} to="/admin" className="dashboard-brand" onClick={() => setOpen(false)}>
            Club Náutico
          </CNavbarBrand>

          <button
            type="button"
            className="dashboard-menu-toggle"
            aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
            aria-expanded={open}
            aria-controls="admin-navigation"
            onClick={() => setOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <CNavbarNav id="admin-navigation" className={`dashboard-nav ${open ? 'is-open' : ''}`}>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/perfil" onClick={() => setOpen(false)}>
                Perfil
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/socios" onClick={() => setOpen(false)}>
                Socios
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/embarcaciones" onClick={() => setOpen(false)}>
                Embarcaciones
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/amarras" onClick={() => setOpen(false)}>
                Amarras
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/boxes" onClick={() => setOpen(false)}>
                Boxes
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/reservas/embarcacion-club" onClick={() => setOpen(false)}>
                Reservas Embarcación Club
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/reservas/travel-lift" onClick={() => setOpen(false)}>
                Reservas Travel Lift
              </CNavLink>
            </CNavItem>
          </CNavbarNav>
          
        </div>

        {/* Derecha: botón logout */}
        <CButton color="light" variant="outline" className="dashboard-logout" onClick={handleLogout}>
          Cerrar sesión
        </CButton>
      </CContainer>
    </CNavbar>
  );
}