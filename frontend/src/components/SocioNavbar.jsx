import {
  CNavbar,
  CContainer,
  CNavbarBrand,
  CButton,
} from '@coreui/react';

export function SocioNavbar({ onSeleccion, paginaActual, socio }) {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const navItems = [
    { key: 'perfil', label: 'Perfil' },
    { key: 'embarcaciones', label: 'Embarcaciones' },
    { key: 'amarras', label: 'Amarras/Boxes' },
    { key: 'reservas', label: 'Reservas' },
    { key: 'reservasTravelLift', label: 'Travel Lift' },
    { key: 'cuotas', label: 'Cuotas' },
  ];

  return (
    <>
      {/* Encabezado principal */}
      <CNavbar colorScheme="light" className="px-3" style={{ backgroundColor: '#146fafff' }} expand="lg" fixed="top">
        <CContainer fluid className="d-flex justify-content-between align-items-center">
          <CNavbarBrand
            onClick={() => onSeleccion(null)}
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
            <div
              key={item.key}
              onClick={() => onSeleccion(item.key)}
              style={{
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '6px 6px 0 0',
                backgroundColor: paginaActual === item.key ? '#ffffff22' : 'transparent',
                color: 'white',
                fontWeight: paginaActual === item.key ? 'bold' : 'normal',
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
