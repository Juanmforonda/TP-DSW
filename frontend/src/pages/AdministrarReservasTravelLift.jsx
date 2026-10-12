import React, { useEffect, useState } from 'react';
import {
  CAlert, CButton, CCard, CCardBody, CCardHeader, CFormInput, CFormSelect,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react';
import { getEmbarcaciones } from '../api/embarcaciones.js';
import { getSocios } from '../api/socios.js';
import {
  cancelarReservaTravelLift, eliminarReservaTravelLift, finalizarReservaTravelLift,
  getReservasTravelLift,
} from '../api/reservasTravelLift.js';

const unwrap = (response) => response?.data?.data ?? response?.data ?? [];
const formatDate = (value) => new Date(value).toLocaleString('es-AR');

export function AdministrarReservasTravelLift() {
  const [reservas, setReservas] = useState([]);
  const [socios, setSocios] = useState([]);
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [estado, setEstado] = useState('ALL');
  const [socio, setSocio] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function load() {
    const [reservasResponse, sociosResponse, embarcacionesResponse] = await Promise.all([
      getReservasTravelLift(),
      getSocios(),
      getEmbarcaciones(),
    ]);
    setReservas(unwrap(reservasResponse));
    setSocios(unwrap(sociosResponse));
    setEmbarcaciones(unwrap(embarcacionesResponse));
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message ?? 'No se pudieron cargar las reservas'));
  }, []);

  async function changeStatus(id, action) {
    try {
      await action(id);
      setMessage('Reserva actualizada.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo actualizar la reserva.');
    }
  }

  async function remove(id) {
    if (!window.confirm('¿Eliminar esta reserva?')) return;
    try {
      await eliminarReservaTravelLift(id);
      setMessage('Reserva eliminada.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo eliminar la reserva.');
    }
  }

  const filtered = reservas.filter((reserva) => {
    if (estado !== 'ALL' && reserva.estado !== estado) return false;
    if (socio && String(reserva.socio?.id ?? reserva.socio) !== socio) return false;
    return true;
  });

  return (
    <CCard className="mt-4">
      <CCardHeader><strong>Administrar reservas de Travel Lift</strong></CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {message && <CAlert color="success">{message}</CAlert>}
        <div className="d-flex gap-2 mb-3">
          <CFormSelect value={estado} onChange={(event) => setEstado(event.target.value)} style={{ maxWidth: 220 }}>
            <option value="ALL">Todos los estados</option><option value="ACTIVA">Activas</option><option value="FINALIZADA">Finalizadas</option><option value="CANCELADA">Canceladas</option>
          </CFormSelect>
          <CFormSelect value={socio} onChange={(event) => setSocio(event.target.value)} style={{ maxWidth: 280 }}>
            <option value="">Todos los socios</option>
            {socios.map((item) => <option key={item.id} value={item.id}>{item.apellido}, {item.nombre}</option>)}
          </CFormSelect>
        </div>
        <CTable striped responsive>
          <CTableHead><CTableRow><CTableHeaderCell>Socio</CTableHeaderCell><CTableHeaderCell>Embarcación</CTableHeaderCell><CTableHeaderCell>Inicio</CTableHeaderCell><CTableHeaderCell>Fin</CTableHeaderCell><CTableHeaderCell>Estado</CTableHeaderCell><CTableHeaderCell /></CTableRow></CTableHead>
          <CTableBody>
            {filtered.map((reserva) => (
              <CTableRow key={reserva.id}>
                <CTableDataCell>{reserva.socio ? `${reserva.socio.apellido}, ${reserva.socio.nombre}` : reserva.socio}</CTableDataCell>
                <CTableDataCell>{reserva.embarcacion?.nombre ?? reserva.embarcacion}</CTableDataCell>
                <CTableDataCell>{formatDate(reserva.fechaHoraInicio)}</CTableDataCell>
                <CTableDataCell>{formatDate(reserva.fechaHoraFin)}</CTableDataCell>
                <CTableDataCell>{reserva.estado}</CTableDataCell>
                <CTableDataCell>
                  {reserva.estado === 'ACTIVA' && <><CButton size="sm" color="warning" className="me-2" onClick={() => changeStatus(reserva.id, cancelarReservaTravelLift)}>Cancelar</CButton><CButton size="sm" color="success" onClick={() => changeStatus(reserva.id, finalizarReservaTravelLift)}>Finalizar</CButton></>}
                  <CButton size="sm" color="danger" className="ms-2" onClick={() => remove(reserva.id)}>Eliminar</CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        {filtered.length === 0 && <div className="text-muted">No hay reservas para los filtros seleccionados.</div>}
        {embarcaciones.length === 0 && <div className="text-muted">No hay embarcaciones cargadas.</div>}
      </CCardBody>
    </CCard>
  );
}
