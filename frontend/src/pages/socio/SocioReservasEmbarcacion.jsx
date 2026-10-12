import React, { useState, useEffect } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CModal,
  CModalHeader,
  CModalFooter,
  CModalBody,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CAlert,
  CCardFooter,
  CCardTitle,
  CBadge,
  CListGroup,
  CListGroupItem,
} from '@coreui/react';
import { getEmbarcacionesClub } from '../../api/embarcaciones.js';
import {
  getReservasPorSocio,
  getReservasPorEmbarcacion,
  crearReservaEmbarcacionClub,
  actualizarReservaEmbarcacionClub,
  cancelarReservaEmbarcacionClub,
  finalizarReservaEmbarcacionClub,
} from '../../api/reservasEmbarcacionClub.js';
import TimeSlotPicker from '../../components/FranjaHoraria.jsx';
import ListaEmbarcacionesClub from '../../components/ListaEmbarcacionesClub.jsx';
import {
  listFromResponse,
  toDateTimeLocal,
  toISOStringOrNull,
  validateReservationRange,
} from '../../utils/reservas.js';

export function SocioReservasEmbarcacion({ idSocio }) {
  const [embarcacionesClub, setEmbarcacionesClub] = useState([]);
  const [reservasSocio, setReservasSocio] = useState([]);
  const [selectedEmb, setSelectedEmb] = useState(null);
  const [reservasEmb, setReservasEmb] = useState([]);

  const [dateSelected, setDateSelected] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [editInicio, setEditInicio] = useState('');
  const [editFin, setEditFin] = useState('');
  const [editError, setEditError] = useState(null);
  const [editDate, setEditDate] = useState(''); // YYYY-MM-DD para el TimeSlotPicker del editar

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [actionReserva, setActionReserva] = useState(null);

  useEffect(() => {
    cargarEmbarcaciones();
    cargarReservasSocio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedEmb) {
      cargarReservasEmbarcacion(selectedEmb);
      setDateSelected('');
      setInicio('');
      setFin('');
    } else setReservasEmb([]);
  }, [selectedEmb]);

  async function cargarEmbarcaciones() {
    try {
      const res = await getEmbarcacionesClub();
      setEmbarcacionesClub(listFromResponse(res));
    } catch {
      setEmbarcacionesClub([]);
    }
  }

  async function cargarReservasSocio() {
    try {
      const res = await getReservasPorSocio(idSocio);
      setReservasSocio(listFromResponse(res));
    } catch {
      setReservasSocio([]);
    }
  }

  async function cargarReservasEmbarcacion(id) {
    try {
      const res = await getReservasPorEmbarcacion(id);
      setReservasEmb(listFromResponse(res));
    } catch {
      setReservasEmb([]);
    }
  }

  function toISO(localValue) {
    return toISOStringOrNull(localValue);
  }

  function clientValidate(startLocal, endLocal, reservas = [], excludeId) {
    return validateReservationRange(startLocal, endLocal, reservas, excludeId);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedEmb) {
      setError('Seleccioná una embarcación del club');
      return;
    }
    const v = clientValidate(inicio, fin, reservasEmb);
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        embarcacion: selectedEmb,
        fechaInicio: toISO(inicio),
        fechaFin: toISO(fin),
        estado: 'ACTIVA',
        socio: idSocio,
      };

      const res = await crearReservaEmbarcacionClub(payload);

      // Axios ya te devuelve los datos en res.data
      console.log('RES crearReserva:', res.data);
      setSuccess('Reserva creada');
      setDateSelected('');
      setInicio('');
      setFin('');
      cargarReservasSocio();
      cargarReservasEmbarcacion(selectedEmb);
    } catch (error) {
      console.error('ERROR crearReserva:', error);
      // Axios lanza el error con la respuesta dentro de error.response
      setError(
        error.response?.data?.message ?? error.message ?? 'Error de conexión'
      );
    } finally {
      setLoading(false);
    }
  }

  function abrirEditar(reserva) {
    setEditingReserva(reserva);
    const inicioLocal = toDateTimeLocal(reserva.fechaInicio);
    const finLocal = toDateTimeLocal(reserva.fechaFin);
    setEditInicio(inicioLocal);
    setEditFin(finLocal);
    setEditDate(inicioLocal?.split?.('T')?.[0] ?? '');
    setEditError(null);
    setEditModalOpen(true);
  }

  async function handleEditSave() {
    setEditError(null);
    const v = clientValidate(
      editInicio,
      editFin,
      reservasEmb,
      editingReserva?.id
    );
    if (v) {
      setEditError(v);
      return;
    }
    try {
      const payload = {
        fechaInicio: toISO(editInicio),
        fechaFin: toISO(editFin),
      };
      const res = await actualizarReservaEmbarcacionClub(
        editingReserva.id,
        payload
      );
      if (res.ok) {
        setEditModalOpen(false);
        cargarReservasSocio();
        if (selectedEmb) cargarReservasEmbarcacion(selectedEmb);
      } else {
        const msg =
          res.data?.message ?? res.message ?? `Error ${res.status ?? ''}`;
        setEditError(msg);
      }
    } catch {
      setEditError('Error de conexión');
    }
  }

  function abrirConfirmarCancelar(reserva) {
    setActionReserva(reserva);
    setCancelModalOpen(true);
  }

  function abrirConfirmarFinalizar(reserva) {
    setActionReserva(reserva);
    setFinalizeModalOpen(true);
  }

  async function confirmarCancelar() {
    if (!actionReserva) return;
    try {
      const res = await cancelarReservaEmbarcacionClub(actionReserva.id);
      alert(res.data?.message ?? 'Reserva cancelada');
      setCancelModalOpen(false);
      setActionReserva(null);
      cargarReservasSocio();
      if (selectedEmb) cargarReservasEmbarcacion(selectedEmb);
    } catch (error) {
      const msg =
        error?.response?.data?.message ?? error?.message ?? 'Error de conexión';
      alert(msg);
    }
  }

  async function confirmarFinalizar() {
    if (!actionReserva) return;
    try {
      const res = await finalizarReservaEmbarcacionClub(actionReserva.id);
      alert(res.data?.message ?? 'Reserva finalizada');
      setFinalizeModalOpen(false);
      setActionReserva(null);
      cargarReservasSocio();
      if (selectedEmb) cargarReservasEmbarcacion(selectedEmb);
    } catch (error) {
      const msg =
        error?.response?.data?.message ?? error?.message ?? 'Error de conexión';
      alert(msg);
    }
  }

  function onTimeSlotChange(a, b) {
    // mismos handler para crear:  (start, end) o { inicioLocal, finLocal } / { start, end }
    let start = a;
    let end = b;
    if (a && typeof a === 'object') {
      start = a.inicioLocal ?? a.start ?? a[0];
      end = a.finLocal ?? a.end ?? a[1];
    }
    setInicio(start || '');
    setFin(end || '');
    if (typeof start === 'string' && start.includes('T')) {
      setDateSelected(start.split('T')[0]);
    }
  }

  function onEditTimeSlotChange(obj) {
    const inicioLocal = obj?.inicioLocal ?? obj?.start ?? obj?.startLocal ?? '';
    const finLocal = obj?.finLocal ?? obj?.end ?? obj?.endLocal ?? '';
    setEditInicio(inicioLocal || '');
    setEditFin(finLocal || '');
    if (typeof inicioLocal === 'string' && inicioLocal.includes('T')) {
      setEditDate(inicioLocal.split('T')[0]);
    }
  }

  const reservasEmbParaEditar = editingReserva
    ? reservasEmb.filter((r) => r.id !== editingReserva.id)
    : reservasEmb;

  const reservasSocioActivas = reservasSocio.filter(
    (r) => r.estado === 'ACTIVA'
  );
  const reservasEmbActivas = reservasEmb.filter((r) => r.estado === 'ACTIVA');

  return (
    <>
      <CContainer className="mt-4">
        <CRow className="g-4">
          <CCol md={3}>
            <CCard className="shadow-sm">
              <CCardHeader>
                <div className="fw-semibold">Embarcaciones del club</div>
                <div className="text-muted small">
                  Selecciona una embarcación
                </div>
              </CCardHeader>
              <CCardBody>
                <ListaEmbarcacionesClub
                  embarcaciones={embarcacionesClub}
                  selectedId={selectedEmb}
                  onSelect={(id) => setSelectedEmb(id)}
                />
              </CCardBody>
            </CCard>
          </CCol>

          <CCol md={9}>
            <CCard className="shadow-sm">
              <CCardHeader>
                <CCardTitle className="mb-0">Reservas</CCardTitle>
                <div className="text-muted small">
                  Crear y gestionar tus reservas
                </div>
              </CCardHeader>
              <CCardBody>
                {selectedEmb ? (
                  <div className="row">
                    <div className="col-md-7">
                      <CCard className="mb-3">
                        <CCardBody>
                          <div className="fw-semibold mb-1">
                            {embarcacionesClub.find((x) => x.id === selectedEmb)
                              ?.nombre ?? '—'}
                          </div>
                          <div className="text-muted small mb-2">
                            {embarcacionesClub.find((x) => x.id === selectedEmb)
                              ?.tipo ?? ''}
                            {' • '}
                            {embarcacionesClub.find((x) => x.id === selectedEmb)
                              ?.capacidad
                              ? `${
                                  embarcacionesClub.find(
                                    (x) => x.id === selectedEmb
                                  )?.capacidad
                                } pax`
                              : ''}
                          </div>
                          <div className="mb-2">
                            <CFormLabel className="mb-1">Fecha</CFormLabel>
                            <CFormInput
                              type="date"
                              value={dateSelected}
                              onChange={(e) => {
                                setDateSelected(e.target.value);
                                setInicio('');
                                setFin('');
                              }}
                            />
                          </div>
                          <div
                            style={{
                              border: '1px solid #eee',
                              padding: 10,
                              borderRadius: 6,
                            }}
                          >
                            <TimeSlotPicker
                              dateLocal={dateSelected}
                              reservas={reservasEmb}
                              onChange={onTimeSlotChange}
                              slotMinutes={30}
                              maxHours={3}
                            />
                          </div>
                          <div className="mt-3 d-flex gap-2">
                            <CButton
                              color="primary"
                              onClick={handleCreate}
                              disabled={loading || !inicio || !fin}
                            >
                              Reservar
                            </CButton>
                            <CButton
                              color="secondary"
                              onClick={() => {
                                setDateSelected('');
                                setInicio('');
                                setFin('');
                                setError(null);
                                setSuccess(null);
                              }}
                            >
                              Limpiar
                            </CButton>
                          </div>
                          {error && (
                            <div className="mt-2">
                              <CAlert color="danger">{error}</CAlert>
                            </div>
                          )}
                          {success && (
                            <div className="mt-2">
                              <CAlert color="success">{success}</CAlert>
                            </div>
                          )}
                        </CCardBody>
                      </CCard>
                    </div>

                    <div className="col-md-5">
                      <CCard>
                        <CCardHeader>
                          <div className="fw-semibold">
                            Reservas de esta embarcación
                          </div>
                        </CCardHeader>
                        <CCardBody
                          style={{ maxHeight: 360, overflowY: 'auto' }}
                        >
                          {reservasEmbActivas.length === 0 ? (
                            <div className="text-muted">
                              No hay reservas activas para esta embarcación
                            </div>
                          ) : (
                            <ul className="mb-0">
                              {reservasEmbActivas.map((r) => (
                                <li key={r.id} className="mb-2">
                                  <div className="fw-semibold">
                                    {new Date(
                                      r.fechaInicio
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-muted small">
                                    {new Date(
                                      r.fechaInicio
                                    ).toLocaleTimeString()}{' '}
                                    —{' '}
                                    {new Date(r.fechaFin).toLocaleTimeString()}{' '}
                                    ({r.estado})
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </CCardBody>
                      </CCard>

                      <div className="mt-3">
                        <CCard>
                          <CCardHeader>
                            <div className="fw-semibold">Mis reservas</div>
                          </CCardHeader>
                          <CCardBody
                            style={{ maxHeight: 220, overflowY: 'auto' }}
                          >
                            {reservasSocioActivas.length === 0 ? (
                              <div className="text-muted">
                                No tenés reservas activas
                              </div>
                            ) : (
                              <CListGroup flush>
                                {reservasSocioActivas.map((r) => (
                                  <CListGroupItem
                                    key={r.id}
                                    className="d-flex justify-content-between align-items-start"
                                  >
                                    <div>
                                      <div className="fw-semibold">
                                        {r.embarcacion?.nombre ?? '—'}
                                      </div>
                                      <div className="text-muted small">
                                        {new Date(
                                          r.fechaInicio
                                        ).toLocaleString()}{' '}
                                        —{' '}
                                        {new Date(r.fechaFin).toLocaleString()}
                                      </div>
                                      <div className="mt-1">
                                        <CBadge
                                          color={
                                            r.estado === 'ACTIVA'
                                              ? 'success'
                                              : r.estado === 'CANCELADA'
                                              ? 'danger'
                                              : 'secondary'
                                          }
                                        >
                                          {r.estado}
                                        </CBadge>
                                      </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                      <CButton
                                        color="warning"
                                        size="sm"
                                        onClick={() => abrirEditar(r)}
                                      >
                                        Editar
                                      </CButton>{' '}
                                      <CButton
                                        color="danger"
                                        size="sm"
                                        onClick={() =>
                                          abrirConfirmarCancelar(r)
                                        }
                                      >
                                        Cancelar
                                      </CButton>{' '}
                                      <CButton
                                        color="primary"
                                        size="sm"
                                        onClick={() =>
                                          abrirConfirmarFinalizar(r)
                                        }
                                      >
                                        Finalizar
                                      </CButton>
                                    </div>
                                  </CListGroupItem>
                                ))}
                              </CListGroup>
                            )}
                          </CCardBody>
                        </CCard>
                        {/* Modal Confirmar Cancelar */}
                        <CModal
                          visible={cancelModalOpen}
                          onClose={() => {
                            setCancelModalOpen(false);
                            setActionReserva(null);
                          }}
                        >
                          <CModalHeader>Confirmar cancelación</CModalHeader>
                          <CModalBody>
                            ¿Confirma cancelar la reserva de{' '}
                            <strong>
                              {actionReserva?.embarcacion?.nombre ?? '–'}
                            </strong>{' '}
                            del{' '}
                            {actionReserva
                              ? new Date(
                                  actionReserva.fechaInicio
                                ).toLocaleString()
                              : '–'}{' '}
                            ?
                          </CModalBody>
                          <CModalFooter>
                            <CButton
                              color="secondary"
                              onClick={() => {
                                setCancelModalOpen(false);
                                setActionReserva(null);
                              }}
                            >
                              Cancelar
                            </CButton>
                            <CButton color="danger" onClick={confirmarCancelar}>
                              Confirmar cancelación
                            </CButton>
                          </CModalFooter>
                        </CModal>

                        {/* Modal Confirmar Finalizar */}
                        <CModal
                          visible={finalizeModalOpen}
                          onClose={() => {
                            setFinalizeModalOpen(false);
                            setActionReserva(null);
                          }}
                        >
                          <CModalHeader>Confirmar finalización</CModalHeader>
                          <CModalBody>
                            ¿Confirma finalizar la reserva de{' '}
                            <strong>
                              {actionReserva?.embarcacion?.nombre ?? '–'}
                            </strong>{' '}
                            del{' '}
                            {actionReserva
                              ? new Date(
                                  actionReserva.fechaInicio
                                ).toLocaleString()
                              : '–'}{' '}
                            ?
                          </CModalBody>
                          <CModalFooter>
                            <CButton
                              color="secondary"
                              onClick={() => {
                                setFinalizeModalOpen(false);
                                setActionReserva(null);
                              }}
                            >
                              Cancelar
                            </CButton>
                            <CButton
                              color="primary"
                              onClick={confirmarFinalizar}
                            >
                              Confirmar finalización
                            </CButton>
                          </CModalFooter>
                        </CModal>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-5 text-muted">
                    Seleccioná una embarcación en el panel izquierdo para ver
                    detalles y reservar.
                  </div>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      {/* Edit modal: usa Date + TimeSlotPicker igual que Crear Reserva */}
      <CModal
        alignment="center"
        visible={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingReserva(null);
          setEditError(null);
        }}
      >
        <CModalHeader>Editar reserva</CModalHeader>
        <CModalBody>
          {editError && <CAlert color="danger">{editError}</CAlert>}
          <CForm className="d-flex flex-column gap-3">
            <div>
              <CFormLabel>Fecha</CFormLabel>
              <CFormInput
                type="date"
                value={editDate}
                onChange={(e) => {
                  setEditDate(e.target.value);
                  // limpiar seleccion de hora al cambiar dia
                  setEditInicio('');
                  setEditFin('');
                }}
              />
            </div>

            <div style={{ border: '1px solid #eee', padding: 10, borderRadius: 6 }}>
              <TimeSlotPicker
                dateLocal={editDate}
                reservas={reservasEmbParaEditar}
                onChange={onEditTimeSlotChange}
                slotMinutes={30}
                maxHours={3}
                excludeReservaId={editingReserva?.id}
              />
            </div>

            <div>
              <CFormLabel>Seleccionado</CFormLabel>
              <div className="d-flex gap-2">
                <CFormInput
                  type="text"
                  value={editInicio ? new Date(editInicio).toLocaleString() : ''}
                  readOnly
                />
                <CFormInput
                  type="text"
                  value={editFin ? new Date(editFin).toLocaleString() : ''}
                  readOnly
                />
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setEditModalOpen(false);
              setEditingReserva(null);
              setEditError(null);
            }}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={handleEditSave}
            disabled={!editInicio || !editFin}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
}
