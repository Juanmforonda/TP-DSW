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
  cilPeople,
  cilPool,
  cilBoatAlt,
  cilCalendar,
  cilAddressBook,
  cilStorage,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import './AdminHome.css';

export default function AdminHome({onSeleccion}) {
  const modules = [
    {
      title: 'Socios',
      icon: cilPeople,
      link: 'socios',
      desc: 'Gestiona socios y sus datos',
    },
    {
      title: 'Amarras',
      icon: cilPool,
      link: 'amarras',
      desc: 'Administra amarras y disponibilidad',
    },
    {
      title: 'Boxes',
      icon: cilStorage,
      link: 'boxes',
      desc: 'Administra boxes y disponibilidad',
    },
    {
      title: 'Embarcaciones',
      icon: cilBoatAlt,
      link: 'embarcaciones',
      desc: 'Gestiona embarcaciones de los socios, tipos y más',
    },
    {
      title: 'Alquileres Amarras/Boxes',
      icon: cilAddressBook,
      link: '/reservas',
      desc: 'Controla los alquileres de boxes y amarras',
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
      desc: 'Gestiona las reservas de uso del Travel Lift',
    },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Administración</h1>
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
