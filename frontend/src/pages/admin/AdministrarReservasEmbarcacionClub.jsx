import React, { useEffect, useState } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CBadge,
  CAlert,
  CForm,
  CFormLabel,
} from '@coreui/react';
import TimeSlotPicker from '../../components/FranjaHoraria.jsx';
import {
  getReservasEmbarcacionClub,
  crearReservaEmbarcacionClub,
  actualizarReservaEmbarcacionClub,
  eliminarReservaEmbarcacionClub,
} from '../../api/reservasEmbarcacionClub.js';
import { getSocios } from '../../api/socios.js';
import { getEmbarcacionesClub } from '../../api/embarcaciones.js';
import {
  listFromResponse,
  toDateTimeLocal,
  toISOStringOrNull,
  validateReservationRange,
} from '../../utils/reservas.js';

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function validateFutureStart(startLocal) {
  if (!startLocal) {
    return 'Seleccioná una fecha y un horario.';
  }

  const start = new Date(startLocal);

  if (Number.isNaN(start.getTime())) {
    return 'La fecha y el horario seleccionados no son válidos.';
  }

  if (start.getTime() < Date.now()) {
    return 'No se puede reservar en una fecha u horario pasado.';
  }

  return null;
}

export function AdministrarReservasEmbarcacionClub() {
  const [reservas, setReservas] = useState([]);
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [socios, setSocios] = useState([]);

  const [error, setError] = useState('');

  // filtros
  const [fEstado, setFEstado] = useState('ALL'); // ALL | ACTIVA | FINALIZADA | CANCELADA
  const [fEmbarcacion, setFEmbarcacion] = useState('');
  const [fSocio, setFSocio] = useState('');
  const [q, setQ] = useState('');

  // crear (ahora con TimeSlotPicker)
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    embarcacionId: '',
    socioId: '',
  });
  const [dateSelectedCreate, setDateSelectedCreate] = useState('');
  const [inicioCreate, setInicioCreate] = useState('');
  const [finCreate, setFinCreate] = useState('');

  // editar (usar franjaHoraria)
  const [editing, setEditing] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editInicio, setEditInicio] = useState('');
  const [editFin, setEditFin] = useState('');
  const [editError, setEditError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // confirm modal (simple overlay) para acciones
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'cancel'|'finalizar'|'delete'
  const [confirmReserva, setConfirmReserva] = useState(null);
  const todayLocal = getTodayLocalDate();

  async function loadInitial() {
    setError('');
    try {
      const [rRes, rEmb, rSoc] = await Promise.all([
        getReservasEmbarcacionClub(),
        getEmbarcacionesClub(),
        getSocios(),
      ]);
      setReservas(listFromResponse(rRes));
      setEmbarcaciones(listFromResponse(rEmb));
      setSocios(listFromResponse(rSoc));
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Error cargando datos'
      );
      setReservas([]);
      setEmbarcaciones([]);
      setSocios([]);
    } 
  }

  useEffect(() => {
    loadInitial();
  }, []);

  // filtrado cliente 
  const reservasFiltradas = (reservas || [])
    .filter((r) => {
      if (!r) return false;
      if (fEstado !== 'ALL' && String(r.estado ?? '').toUpperCase() !== fEstado)
        return false;
      if (
        fEmbarcacion &&
        String(r.embarcacion?.id ?? r.embarcacion) !== String(fEmbarcacion)
      )
        return false;
      if (fSocio && String(r.socio ?? '') !== String(fSocio)) return false;
      if (q) {
        const tq = q.toLowerCase();
        const emb = (r.embarcacion?.nombre ?? '').toLowerCase();
        const socio = (
          typeof r.socio === 'object' ? r.socio?.nombre ?? '' : ''
        ).toLowerCase();
        if (!emb.includes(tq) && !socio.includes(tq) && String(r.id) !== q)
          return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

  // reservas de la embarcación seleccionada en crear
  const reservasEmbForCreate = createForm.embarcacionId
    ? reservas.filter(
        (r) =>
          String(r.embarcacion?.id ?? r.embarcacion) ===
          String(createForm.embarcacionId)
      )
    : [];

  // reservas de la embarcación del elemento que se edita
  const reservasEmbForEdit = editing
    ? reservas.filter(
        (r) =>
          String(r.embarcacion?.id ?? r.embarcacion) ===
          String(editing.embarcacion?.id ?? editing.embarcacion)
      )
    : [];

  // helpers datetime-local <-> ISO + utilidades de validación
  const toISO = toISOStringOrNull;
  const toLocal = toDateTimeLocal;

  function clientValidate(startLocal, endLocal, reservas = [], excludeId) {
    return validateReservationRange(startLocal, endLocal, reservas, excludeId);
  }

  // create handlers using TimeSlotPicker
  const handleCreateChange = (k, v) => setCreateForm((s) => ({ ...s, [k]: v }));
  function onTimeSlotChangeCreate(a, b) {
    let start = a;
    let end = b;
    if (a && typeof a === 'object') {
      start = a.inicioLocal ?? a.start ?? a[0];
      end = a.finLocal ?? a.end ?? a[1];
    }
    setInicioCreate(start || '');
    setFinCreate(end || '');
    if (typeof start === 'string' && start.includes('T'))
      setDateSelectedCreate(start.split('T')[0]);
  }

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!createForm.embarcacionId || !createForm.socioId) {
      setError('Seleccioná embarcación y socio');
      return;
    }
    const v = clientValidate(inicioCreate, finCreate, reservasEmbForCreate);
    if (v) {
      setError(v);
      return;
    }
    const errorFecha = validateFutureStart(inicioCreate);

    if (errorFecha) {
      setError(errorFecha);
      return;
    }
    try {
      await crearReservaEmbarcacionClub({
        embarcacion: parseInt(createForm.embarcacionId, 10),
        socio: parseInt(createForm.socioId, 10),
        fechaInicio: toISO(inicioCreate),
        fechaFin: toISO(finCreate),
        estado: 'ACTIVA',
      });
      // limpiar
      setShowCreate(false);
      setCreateForm({ embarcacionId: '', socioId: '' });
      setDateSelectedCreate('');
      setInicioCreate('');
      setFinCreate('');
      await loadInitial();
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Error creando reserva'
      );
    }
  };

  // editar handlers usando TimeSlotPicker
  function openEdit(reserva) {
    setEditing(reserva);
    const inicioLocal = toLocal(reserva.fechaInicio);
    const finLocal = toLocal(reserva.fechaFin);
    setEditDate(inicioLocal?.split?.('T')?.[0] ?? '');
    setEditInicio(inicioLocal);
    setEditFin(finLocal);
    setEditError(null);
    setEditModalOpen(true);
  }

  function onTimeSlotChangeEdit(obj) {
    const inicioLocal = obj?.inicioLocal ?? obj?.start ?? obj?.startLocal ?? '';
    const finLocal = obj?.finLocal ?? obj?.end ?? obj?.endLocal ?? '';
    setEditInicio(inicioLocal || '');
    setEditFin(finLocal || '');
    if (typeof inicioLocal === 'string' && inicioLocal.includes('T'))
      setEditDate(inicioLocal.split('T')[0]);
  }

  const saveEdit = async () => {
    if (!editing) return;
    setEditError(null);
    const errorFecha = validateFutureStart(editInicio);
    if (errorFecha) {
      setEditError(errorFecha);
      return;
    }
    const v = clientValidate(
      editInicio,
      editFin,
      reservasEmbForEdit,
      editing.id
    );
    if (v) {
      setEditError(v);
      return;
    }
    try {
      await actualizarReservaEmbarcacionClub(editing.id, {
        fechaInicio: toISO(editInicio),
        fechaFin: toISO(editFin),
      });
      setEditModalOpen(false);
      setEditing(null);
      setEditDate('');
      setEditInicio('');
      setEditFin('');
      await loadInitial();
    } catch (err) {
      setEditError(
        err?.response?.data?.message ??
          err?.message ??
          'Error guardando cambios'
      );
    }
  };

  // acciones (cancelar/finalizar/eliminar)
  function openConfirm(reserva, action) {
    setConfirmReserva(reserva);
    setConfirmAction(action);
    setConfirmOpen(true);
  }
  const executeConfirm = async () => {
    if (!confirmReserva || !confirmAction) return;
    try {
      if (confirmAction === 'cancel') {
        await actualizarReservaEmbarcacionClub(confirmReserva.id, {
          estado: 'CANCELADA',
        });
      } else if (confirmAction === 'finalizar') {
        await actualizarReservaEmbarcacionClub(confirmReserva.id, {
          estado: 'FINALIZADA',
        });
      } else if (confirmAction === 'delete') {
        await eliminarReservaEmbarcacionClub(confirmReserva.id);
      }
      setConfirmOpen(false);
      setConfirmReserva(null);
      setConfirmAction(null);
      await loadInitial();
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          'Error ejecutando acción'
      );
    }
  };

  function estadoBadge(estado) {
    const e = (estado ?? '').toUpperCase();
    if (e === 'ACTIVA') return <CBadge color="success">ACTIVA</CBadge>;
    if (e === 'FINALIZADA')
      return <CBadge color="secondary">FINALIZADA</CBadge>;
    if (e === 'CANCELADA') return <CBadge color="danger">CANCELADA</CBadge>;
    return <CBadge color="info">{estado}</CBadge>;
  }

  function aplicarFiltros() {
    // recargar desde servidor para mantener consistencia
    loadInitial();
  }

  return (
    <CContainer className="mt-4">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center" style={{ fontSize: '1.25rem' }}>
          <div>
            <strong>Administrar Reservas Embarcación del Club</strong>
          </div>
          <div className="d-flex gap-2">
            <CButton
              color="primary"
              size="sm"
              onClick={() => setShowCreate((s) => !s)}
            >
              {showCreate ? 'Cerrar crear' : 'Crear reserva'}
            </CButton>
            <CButton
              color="secondary"
              size="sm"
              onClick={() => {
                setFEstado('ALL');
                setFEmbarcacion('');
                setFSocio('');
                setQ('');
                aplicarFiltros();
              }}
            >
              Recargar
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          {showCreate && (
            <CCard className="mb-3">
              <CCardBody>
                <CForm className="row g-3" onSubmit={handleCreate}>
                  <CCol md={4}>
                    <CFormLabel>Embarcación</CFormLabel>
                    <CFormSelect
                      value={createForm.embarcacionId}
                      onChange={(e) =>
                        handleCreateChange('embarcacionId', e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {embarcaciones.map((em) => (
                        <option key={em.id} value={em.id}>
                          {em.nombre}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={4}>
                    <CFormLabel>Socio</CFormLabel>
                    <CFormSelect
                      value={createForm.socioId}
                      onChange={(e) =>
                        handleCreateChange('socioId', e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      {socios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre ?? s.id}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={4}>
                    <CFormLabel>Fecha</CFormLabel>
                    <CFormInput
                      type="date"
                      min={todayLocal}
                      value={dateSelectedCreate}
                      onChange={(e) => {
                        setDateSelectedCreate(e.target.value);
                        setInicioCreate('');
                        setFinCreate('');
                      }}
                    />
                  </CCol>

                  <CCol xs={12}>
                    <div
                      style={{
                        border: '1px solid #eee',
                        padding: 10,
                        borderRadius: 6,
                      }}
                    >
                      <TimeSlotPicker
                        dateLocal={dateSelectedCreate}
                        reservas={reservasEmbForCreate}
                        onChange={onTimeSlotChangeCreate}
                        slotMinutes={30}
                        maxHours={3}
                      />
                    </div>
                  </CCol>

                  <CCol xs={12} className="d-flex gap-2">
                    <CButton
                      color="success"
                      type="submit"
                      disabled={
                        !createForm.embarcacionId ||
                        !createForm.socioId ||
                        !inicioCreate ||
                        !finCreate
                      }
                    >
                      Crear
                    </CButton>
                    <CButton
                      color="secondary"
                      onClick={() => {
                        setShowCreate(false);
                        setCreateForm({ embarcacionId: '', socioId: '' });
                        setDateSelectedCreate('');
                        setInicioCreate('');
                        setFinCreate('');
                      }}
                    >
                      Cancelar
                    </CButton>
                  </CCol>
                </CForm>
              </CCardBody>
            </CCard>
          )}

          {/* filtros */}
          <CRow className="mb-3 g-2">
            <CCol md={3}>
              <CFormSelect
                value={fEstado}
                onChange={(e) => setFEstado(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACTIVA">Activas</option>
                <option value="FINALIZADA">Finalizadas</option>
                <option value="CANCELADA">Canceladas</option>
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormSelect
                value={fEmbarcacion}
                onChange={(e) => setFEmbarcacion(e.target.value)}
              >
                <option value="">Todas las embarcaciones</option>
                {embarcaciones.map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.nombre}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3}>
              <CFormSelect
                value={fSocio}
                onChange={(e) => setFSocio(e.target.value)}
              >
                <option value="">Todos los socios</option>
                {socios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre ?? s.id}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={3} className="d-flex gap-2">
              <CFormInput
                placeholder="Buscar (embar, socio, id)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <CButton
                color="secondary"
                onClick={() => {
                  setFEstado('ALL');
                  setFEmbarcacion('');
                  setFSocio('');
                  setQ('');
                }}
              >
                Limpiar
              </CButton>
              <CButton color="primary" onClick={aplicarFiltros}>
                Filtrar
              </CButton>
            </CCol>
          </CRow>

          {/* tabla */}
          <div style={{ overflowX: 'auto' }}>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Embarcación</CTableHeaderCell>
                  <CTableHeaderCell>Socio</CTableHeaderCell>
                  <CTableHeaderCell>Inicio</CTableHeaderCell>
                  <CTableHeaderCell>Fin</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reservasFiltradas.map((r) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell>{r.id}</CTableDataCell>
                    <CTableDataCell>
                      {r.embarcacion?.nombre ?? '—'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {typeof r.socio === 'object'
                        ? r.socio?.nombre ?? r.socio?.id
                        : r.socio ?? '—'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(r.fechaInicio).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(r.fechaFin).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>{estadoBadge(r.estado)}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-2">
                        <CButton
                          size="sm"
                          color="warning"
                          onClick={() => openEdit(r)}
                        >
                          Editar
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => openConfirm(r, 'cancel')}
                        >
                          Cancelar
                        </CButton>
                        <CButton
                          size="sm"
                          color="primary"
                          onClick={() => openConfirm(r, 'finalizar')}
                        >
                          Finalizar
                        </CButton>
                        <CButton
                          size="sm"
                          color="outline-danger"
                          onClick={() => openConfirm(r, 'delete')}
                        >
                          Eliminar
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {reservasFiltradas.length === 0 && (
                  <CTableRow>
                    <CTableDataCell
                      colSpan={7}
                      className="text-center text-muted"
                    >
                      No hay reservas
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>

        <CCardFooter className="text-muted small">
          Filtrar por estado, embarcación o socio. Acciones: cancelar /
          finalizar / eliminar.
        </CCardFooter>
      </CCard>

      {/* Edit modal con TimeSlotPicker */}
      <CModal
        visible={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditing(null);
          setEditError(null);
        }}
      >
        <CModalHeader>Editar reserva #{editing?.id}</CModalHeader>
        <CModalBody>
          {editError && <CAlert color="danger">{editError}</CAlert>}
          <CForm className="row g-3">
            <CCol md={4}>
              <CFormLabel>Fecha</CFormLabel>
              <CFormInput
                type="date"
                min={todayLocal}
                value={editDate}
                onChange={(e) => {
                  setEditDate(e.target.value);
                  setEditInicio('');
                  setEditFin('');
                }}
              />
            </CCol>

            <CCol xs={12}>
              <div
                style={{
                  border: '1px solid #eee',
                  padding: 10,
                  borderRadius: 6,
                }}
              >
                <TimeSlotPicker
                  dateLocal={editDate}
                  reservas={reservasEmbForEdit}
                  onChange={onTimeSlotChangeEdit}
                  slotMinutes={30}
                  maxHours={3}
                  excludeReservaId={editing?.id}
                />
              </div>
            </CCol>

            <CCol md={6}>
              <CFormLabel>Inicio seleccionado</CFormLabel>
              <CFormInput
                readOnly
                value={editInicio ? new Date(editInicio).toLocaleString() : ''}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Fin seleccionado</CFormLabel>
              <CFormInput
                readOnly
                value={editFin ? new Date(editFin).toLocaleString() : ''}
              />
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setEditModalOpen(false);
              setEditing(null);
              setEditError(null);
            }}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={saveEdit}
            disabled={!editInicio || !editFin}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal confirmar acción */}
      <CModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <CModalHeader>
          {confirmAction === 'delete'
            ? 'Eliminar reserva'
            : confirmAction === 'cancel'
            ? 'Cancelar reserva'
            : 'Finalizar reserva'}
        </CModalHeader>
        <CModalBody>
          ¿Confirma{' '}
          {confirmAction === 'delete'
            ? 'eliminar definitivamente'
            : confirmAction === 'cancel'
            ? 'cancelar'
            : 'finalizar'}{' '}
          la reserva{' '}
          <strong>{confirmReserva ? `#${confirmReserva.id}` : ''}</strong> de{' '}
          <strong>{confirmReserva?.embarcacion?.nombre ?? '—'}</strong>{' '}
          programada para{' '}
          {confirmReserva
            ? new Date(confirmReserva.fechaInicio).toLocaleString()
            : '—'}
          ?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </CButton>
          <CButton
            color={
              confirmAction === 'delete'
                ? 'danger'
                : confirmAction === 'cancel'
                ? 'danger'
                : 'primary'
            }
            onClick={executeConfirm}
          >
            Confirmar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
}
