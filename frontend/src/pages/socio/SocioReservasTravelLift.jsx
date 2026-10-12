import React, { useEffect, useState } from 'react';
import {
  CAlert, CButton, CCard, CCardBody, CCardHeader, CForm, CFormInput,
  CFormLabel, CFormSelect, CTable, CTableBody, CTableDataCell, CTableHead,
  CTableHeaderCell, CTableRow,
} from '@coreui/react';
import { getEmbarcacionesActivasPorSocio } from '../../api/embarcaciones.js';
import {
  cancelarReservaTravelLift, crearReservaTravelLift, finalizarReservaTravelLift,
  getReservasTravelLift, getReservasTravelLiftPorSocio,
} from '../../api/reservasTravelLift.js';
import TravelLiftTimePicker from '../../components/TravelLiftTimePicker.jsx';
import { formatReservationDate, listFromResponse } from '../../utils/reservas.js';

const unwrap = listFromResponse;

export function SocioReservasTravelLift({ idSocio }) {
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [todasLasReservas, setTodasLasReservas] = useState([]);
  const [embarcacion, setEmbarcacion] = useState('');
  const [fecha, setFecha] = useState('');
  const [horario, setHorario] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    const [boats, own, all] = await Promise.all([
      getEmbarcacionesActivasPorSocio(idSocio),
      getReservasTravelLiftPorSocio(idSocio),
      getReservasTravelLift(),
    ]);
    setEmbarcaciones(unwrap(boats));
    setReservas(unwrap(own));
    setTodasLasReservas(unwrap(all));
  }

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message ?? 'No se pudieron cargar las reservas'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSocio]);

  async function crear(event) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!embarcacion || !horario) {
      setError('Seleccioná una embarcación, fecha y horario.');
      return;
    }
    try {
      await crearReservaTravelLift({
        socio: idSocio,
        embarcacion: Number(embarcacion),
        fechaHoraInicio: horario.inicioLocal,
        fechaHoraFin: horario.finLocal,
        estado: 'ACTIVA',
      });
      setMessage('Reserva de Travel Lift creada.');
      setEmbarcacion('');
      setFecha('');
      setHorario(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo crear la reserva.');
    }
  }

  async function cambiarEstado(reserva, accion) {
    try {
      await accion(reserva.id);
      setMessage('Reserva actualizada.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message ?? 'No se pudo actualizar la reserva.');
    }
  }

  return (
    <CCard className="mt-4">
      <CCardHeader><strong>Reservas de Travel Lift</strong></CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {message && <CAlert color="success">{message}</CAlert>}
        <CForm onSubmit={crear} className="row g-3 mb-4">
          <div className="col-md-4">
            <CFormLabel>Embarcación</CFormLabel>
            <CFormSelect value={embarcacion} onChange={(event) => setEmbarcacion(event.target.value)}>
              <option value="">Seleccionar...</option>
              {embarcaciones.map((boat) => <option key={boat.id} value={boat.id}>{boat.nombre} ({boat.matricula})</option>)}
            </CFormSelect>
          </div>
          <div className="col-md-3">
            <CFormLabel>Fecha</CFormLabel>
            <CFormInput type="date" value={fecha} min={new Date().toISOString().slice(0, 10)} onChange={(event) => { setFecha(event.target.value); setHorario(null); }} />
          </div>
          <div className="col-12">
            <TravelLiftTimePicker dateLocal={fecha} reservas={todasLasReservas} onChange={setHorario} />
          </div>
          <div className="col-12"><CButton type="submit">Reservar Travel Lift</CButton></div>
        </CForm>
        <CTable striped responsive>
          <CTableHead><CTableRow><CTableHeaderCell>Embarcación</CTableHeaderCell><CTableHeaderCell>Inicio</CTableHeaderCell><CTableHeaderCell>Fin</CTableHeaderCell><CTableHeaderCell>Estado</CTableHeaderCell><CTableHeaderCell /></CTableRow></CTableHead>
          <CTableBody>
            {reservas.map((reserva) => (
              <CTableRow key={reserva.id}>
                <CTableDataCell>{reserva.embarcacion?.nombre ?? reserva.embarcacion}</CTableDataCell>
                <CTableDataCell>{formatReservationDate(reserva.fechaHoraInicio)}</CTableDataCell>
                <CTableDataCell>{formatReservationDate(reserva.fechaHoraFin)}</CTableDataCell>
                <CTableDataCell>{reserva.estado}</CTableDataCell>
                <CTableDataCell>
                  {reserva.estado === 'ACTIVA' && <><CButton size="sm" color="warning" className="me-2" onClick={() => cambiarEstado(reserva, cancelarReservaTravelLift)}>Cancelar</CButton><CButton size="sm" color="success" onClick={() => cambiarEstado(reserva, finalizarReservaTravelLift)}>Finalizar</CButton></>}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
}
