import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CButton,
} from '@coreui/react';
import { Link, NavLink } from 'react-router-dom';

export function SocioNavbar({ socio }) {
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
      <CNavbar colorScheme="light" className="px-3" style={{ backgroundColor: '#146fafff' }} expand="lg" fixed="top">
        <CContainer fluid className="d-flex justify-content-between align-items-center">
          <CNavbarBrand
            as={Link}
            to="/socio"
            style={{
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.9rem',
              fontWeight: 'bold',
            }}
          >
            {socio ? `${socio.apellido} ${socio.nombre}` : 'Socio'}
          </CNavbarBrand>

          <CButton color="light" variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </CButton>
        </CContainer>
      </CNavbar>

      {/* Barra secundaria integrada */}
      <div className="px-4" style={{ backgroundColor: '#146fafff' }}>
        <div className="d-flex gap-3 pt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={`/socio/${item.key}`}
              className="text-decoration-none"
              style={({ isActive }) => ({
                padding: '6px 12px',
                borderRadius: '6px 6px 0 0',
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
