import React from 'react';
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

export function AdminNavbar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <CNavbar colorScheme="dark" className="bg-primary px-3" expand="lg" fixed="top">
      <CContainer fluid className="d-flex justify-content-between align-items-center">
        {/* Izquierda: brand + navegación */}
        <div className="d-flex align-items-center">
          <CNavbarBrand as={Link} to="/admin" style={{ color: 'white', marginRight: '1rem' }}>
            Club Náutico
          </CNavbarBrand>

          <CNavbarNav className="d-flex flex-row">
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/perfil" style={{ color: 'white' }}>
                Perfil
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/socios" style={{ color: 'white' }}>
                Socios
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/embarcaciones" style={{ color: 'white' }}>
                Embarcaciones
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/amarras" style={{ color: 'white' }}>
                Amarras
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/boxes" style={{ color: 'white' }}>
                Boxes
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/reservas/embarcacion-club" style={{ color: 'white' }}>
                Reservas Embarcación Club
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink as={NavLink} to="/admin/reservas/travel-lift" style={{ color: 'white' }}>
                Reservas Travel Lift
              </CNavLink>
            </CNavItem>
          </CNavbarNav>
          
        </div>

        {/* Derecha: botón logout */}
        <CButton color="light" variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </CButton>
      </CContainer>
    </CNavbar>
  );
}