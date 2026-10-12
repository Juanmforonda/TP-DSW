import React from 'react';
import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CNavbarNav,
  CNavItem,
  CNavLink,
  CButton,
} from '@coreui/react';

export function AdminNavbar({ onSeleccion, paginaActual }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <CNavbar colorScheme="dark" className="bg-primary px-3" expand="lg" fixed="top">
      <CContainer fluid className="d-flex justify-content-between align-items-center">
        {/* Izquierda: brand + navegación */}
        <div className="d-flex align-items-center">
          <CNavbarBrand
            onClick={() => onSeleccion(null)}
            style={{ cursor: 'pointer', color: 'white', marginRight: '1rem' }}
          >
            Club Náutico
          </CNavbarBrand>

          <CNavbarNav className="d-flex flex-row">
            <CNavItem>
              <CNavLink
                active={paginaActual === 'perfil'}
                href="#"
                onClick={() => onSeleccion('perfil')}
                style={{ color: 'white' }}
              >
                Perfil
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={paginaActual === 'socios'}
                href="#"
                onClick={() => onSeleccion('socios')}
                style={{ color: 'white' }}
              >
                Socios
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={paginaActual === 'embarcaciones'}
                href="#"
                onClick={() => onSeleccion('embarcaciones')}
                style={{ color: 'white' }}
              >
                Embarcaciones
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={paginaActual === 'amarras'}
                href="#"
                onClick={() => onSeleccion('amarras')}
                style={{ color: 'white' }}
              >
                Amarras
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={paginaActual === 'boxes'}
                href="#"
                onClick={() => onSeleccion('boxes')}
                style={{ color: 'white' }}
              >
                Boxes
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={paginaActual === 'reservasEmbarcacionClub'}
                href="#"
                onClick={() => onSeleccion('reservasEmbarcacionClub')}
                style={{ color: 'white' }}
              >
                Reservas Embarcación Club
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={paginaActual === 'reservasTravelLift'}
                href="#"
                onClick={() => onSeleccion('reservasTravelLift')}
                style={{ color: 'white' }}
              >
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