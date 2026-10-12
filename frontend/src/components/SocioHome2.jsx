import React from 'react';
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CRow,
  CCol,
} from '@coreui/react';
import {
  cilBoatAlt,
  cilCalendar,
  cilAddressBook,
  cilStorage,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import './AdminHome.css';

export function SocioHome2({onSeleccion}) {
  const modules = [
    {
      title: 'Embarcaciones',
      icon: cilBoatAlt,
      link: 'embarcaciones',
      desc: 'Gestiona embarcaciones de los socios, tipos y más',
    },
    {
      title: 'Cuotas',
      icon: cilAddressBook,
      link: 'cuotas',
      desc: 'Controla tus cuotas y pagos',
    },
    {
      title: 'Reservas Embarcación Club',
      icon: cilCalendar,
      link: 'reservas/embarcacion-club',
      desc: 'Gestiona las reservas de embarcaciones del club',
    },
    {
      title: 'Reservas Travel Lift',
      icon: cilCalendar,
      link: 'reservas/travel-lift',
      desc: 'Reserva el Travel Lift para tu embarcación',
    },
    {
      title: 'Alquileres Amarras/Boxes',
      icon: cilStorage,
      link: 'amarras',
      desc: 'Controla los alquileres de boxes y amarras',
    },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Socio</h1>
      <p className="admin-subtitle">
        Selecciona una funcionalidad para comenzar
      </p>

      <CRow className="g-4">
        {modules.map((m, idx) => (
          <CCol xs={12} sm={6} md={3} key={idx}>
            <CCard
              className="admin-card"
              onClick={() => onSeleccion(m.link)}
            >
              <CCardBody className="text-center">
                <CIcon icon={m.icon} size="3xl" className="admin-icon"    />
                <CCardTitle>{m.title}</CCardTitle>
                <CCardText>{m.desc}</CCardText>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  );
}
