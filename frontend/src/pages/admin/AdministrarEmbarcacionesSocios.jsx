import React, { useEffect, useState } from 'react'

import {
  getEmbarcaciones,
  actualizarEmbarcacion,
  eliminarEmbarcacion,
  reactivarEmbarcacion,
  cambiarUbicacionEmbarcacion,
} from '../../api/embarcaciones.js';
import { getAmarras } from '../../api/amarras.js';
import { getBoxes } from '../../api/boxes.js';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react';
import { EntityTable } from '../../components/TablaGenerica.jsx';

const columnsConSocio = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'eslora', label: 'Eslora' },
  { key: 'tipoEmbarcacion', label: 'Tipo' },
  { key: 'socio', label: 'Socio', readonly: true },
  { key: 'estadoBaja', label: 'Estado' },
];

const columnsClub = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'eslora', label: 'Eslora' },
  { key: 'tipoEmbarcacion', label: 'Tipo' },
  { key: 'estadoBaja', label: 'Estado' },
];

export function AdministrarEmbarcacionesSocios() {
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // historial
  const [historialOpen, setHistorialOpen] = useState(false);
  const [reservasSeleccionadas, setReservasSeleccionadas] = useState([]);

  // cambiar ubicación
  const [cambiarUbicacionOpen, setCambiarUbicacionOpen] = useState(false);
  const [embarcacionSeleccionada, setEmbarcacionSeleccionada] = useState(null);
  const [amarrasLibres, setAmarrasLibres] = useState([]);
  const [boxesLibres, setBoxesLibres] = useState([]);
  const [tipoUbicacion, setTipoUbicacion] = useState('amarra');
  const [ubicacionElegida, setUbicacionElegida] = useState('');
  const [errorUbicacion, setErrorUbicacion] = useState('');

  useEffect(() => {
    cargarEmbarcaciones();
  }, []);

  const cargarEmbarcaciones = async () => {
    try {
      setLoading(true);
      const res = await getEmbarcaciones({ incluirInactivas: true });
      setEmbarcaciones(res.data.data.map(mapEmbarcacionToRow));
    } catch (error) {
      console.error('Error al cargar embarcaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, datosActualizados) => {
    try {
      await actualizarEmbarcacion(id, datosActualizados);
      cargarEmbarcaciones();
    } catch (error) {
      console.error('Error al actualizar embarcación:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eliminarEmbarcacion(id); // baja lógica en el backend
      cargarEmbarcaciones();
    } catch (error) {
      console.error('Error al dar de baja la embarcación:', error);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await reactivarEmbarcacion(id);
      await cargarEmbarcaciones();
    } catch (error) {
      window.alert(error?.response?.data?.message ?? 'No se pudo reactivar la embarcación');
    }
  };

  const verHistorial = (item) => {
    setReservasSeleccionadas(item.reservasInfraestructura);
    setHistorialOpen(true);
  };

  const abrirCambiarUbicacion = async (item) => {
    setEmbarcacionSeleccionada(item);
    setErrorUbicacion('');
    setUbicacionElegida('');
    setTipoUbicacion('amarra');
    try {
      const [resAmarras, resBoxes] = await Promise.all([
        getAmarras(),
        getBoxes(),
      ]);
      setAmarrasLibres(
        resAmarras.data.data.filter((a) => a.estado === 'libre'),
      );
      setBoxesLibres(
        resBoxes.data.data.filter((b) => b.estado === 'disponible'),
      );
      setCambiarUbicacionOpen(true);
    } catch (error) {
      console.error('Error al cargar amarras/boxes disponibles:', error);
    }
  };

  const confirmarCambioUbicacion = async () => {
    if (!ubicacionElegida) return;
    try {
      setErrorUbicacion('');
      const payload =
        tipoUbicacion === 'amarra'
          ? { amarra: Number(ubicacionElegida) }
          : { box: Number(ubicacionElegida) };

      await cambiarUbicacionEmbarcacion(embarcacionSeleccionada.id, payload);
      setCambiarUbicacionOpen(false);
      cargarEmbarcaciones();
    } catch (error) {
      const msg =
        error?.response?.data?.message ?? 'Error al cambiar la ubicación';
      setErrorUbicacion(msg);
    }
  };

  const cumpleFiltros = (e) => {
    const matchTipo = filtroTipo === '' || e.tipoEmbarcacion === filtroTipo;
    const matchEstado = filtroEstado === '' || e.estadoBaja === filtroEstado;
    return matchTipo && matchEstado;
  };

  const embarcacionesSocios = embarcaciones.filter(
    (e) => e.esClub === false && cumpleFiltros(e),
  );
  const embarcacionesClub = embarcaciones.filter(
    (e) => e.esClub === true && cumpleFiltros(e),
  );

  const tiposDisponibles = [
    ...new Set(embarcaciones.map((e) => e.tipoEmbarcacion).filter(Boolean)),
  ];

  const extraActionsFor = (item) => (
    <>
      <CButton color="info" size="sm" onClick={() => verHistorial(item)}>
        Ver reservas
      </CButton>{' '}
      {item.estadoBaja === 'inactiva' && (
        <CButton
          color="success"
          size="sm"
          onClick={() => handleReactivate(item.id)}
        >
          Reactivar
        </CButton>
      )}{' '}
      <CButton
        color="primary"
        size="sm"
        disabled={item.estadoBaja === 'inactiva'}
        onClick={() => abrirCambiarUbicacion(item)}
      >
        Cambiar ubicación
      </CButton>
    </>
  );

  if (loading) return <p>Cargando embarcaciones...</p>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Listado de embarcaciones</h2>
      </div>

      <CRow className="mb-4">
        <CCol xs={4}>
          <CFormSelect
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposDisponibles.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol xs={4}>
          <CFormSelect
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todas (activas e inactivas)</option>
            <option value="activa">Activas</option>
            <option value="inactiva">Inactivas</option>
          </CFormSelect>
        </CCol>
      </CRow>

      <h4 className="mb-3">Embarcaciones de Socios</h4>
      <EntityTable
        columns={columnsConSocio}
        data={embarcacionesSocios}
        entityName="embarcacion"
        onEdit={handleEdit}
        onDelete={handleDelete}
        extraActions={extraActionsFor}
      />

      <h4 className="mb-3 mt-5">Embarcaciones del Club</h4>
      <EntityTable
        columns={columnsClub}
        data={embarcacionesClub}
        entityName="embarcacion"
        onEdit={handleEdit}
        onDelete={handleDelete}
        extraActions={extraActionsFor}
      />

      {/* Modal historial de reservas */}
      <CModal
        visible={historialOpen}
        onClose={() => setHistorialOpen(false)}
        size="lg"
      >
        <CModalHeader>Historial de reservas</CModalHeader>
        <CModalBody>
          {reservasSeleccionadas.length === 0 ? (
            <p>Esta embarcación no tiene reservas registradas.</p>
          ) : (
            <CTable striped bordered small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Ubicación</CTableHeaderCell>
                  <CTableHeaderCell>Fecha Inicio</CTableHeaderCell>
                  <CTableHeaderCell>Fecha Fin</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Precio</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {reservasSeleccionadas.map((r) => (
                  <CTableRow key={r.id}>
                    <CTableDataCell>
                      {r.amarra
                        ? `Amarra ${r.amarra.id}`
                        : r.box
                          ? `Box ${r.box.id}`
                          : '—'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {new Date(r.fechaInicio).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      {r.fechaFin
                        ? new Date(r.fechaFin).toLocaleDateString()
                        : 'Vigente'}
                    </CTableDataCell>
                    <CTableDataCell>{r.estado}</CTableDataCell>
                    <CTableDataCell>${r.precioMensualFinal}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setHistorialOpen(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal cambiar ubicación */}
      <CModal
        visible={cambiarUbicacionOpen}
        onClose={() => setCambiarUbicacionOpen(false)}
      >
        <CModalHeader>Cambiar ubicación</CModalHeader>
        <CModalBody>
          {errorUbicacion && <p className="text-danger">{errorUbicacion}</p>}
          <div className="mb-3">
            <label className="form-label">Tipo de ubicación</label>
            <CFormSelect
              value={tipoUbicacion}
              onChange={(e) => {
                setTipoUbicacion(e.target.value);
                setUbicacionElegida('');
              }}
            >
              <option value="amarra">Amarra</option>
              <option value="box">Box</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
            <label className="form-label">
              {tipoUbicacion === 'amarra'
                ? 'Amarras libres'
                : 'Boxes disponibles'}
            </label>
            <CFormSelect
              value={ubicacionElegida}
              onChange={(e) => setUbicacionElegida(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {(tipoUbicacion === 'amarra' ? amarrasLibres : boxesLibres).map(
                (u) => (
                  <option key={u.id} value={u.id}>
                    {tipoUbicacion === 'amarra'
                      ? `Amarra ${u.id} — Zona ${u.zona} — $${u.precioMensualBase}`
                      : `Box ${u.id} — Nro ${u.nroBox} — $${u.precioMensualBase}`}
                  </option>
                ),
              )}
            </CFormSelect>
            {(tipoUbicacion === 'amarra' ? amarrasLibres : boxesLibres)
              .length === 0 && (
              <p className="text-muted mt-2">
                No hay {tipoUbicacion === 'amarra' ? 'amarras' : 'boxes'}{' '}
                disponibles.
              </p>
            )}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => setCambiarUbicacionOpen(false)}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            disabled={!ubicacionElegida}
            onClick={confirmarCambioUbicacion}
          >
            Confirmar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}

function mapEmbarcacionToRow(embarcacion) {
  return {
    id: embarcacion.id,
    nombre: embarcacion.nombre,
    matricula: embarcacion.matricula,
    eslora: embarcacion.eslora,
    tipoEmbarcacion:
      embarcacion.tipoEmbarcacion?.nombre ?? embarcacion.tipoEmbarcacion ?? '—',
    socio: embarcacion.socio
      ? `${embarcacion.socio.nombre} ${embarcacion.socio.apellido}`
      : 'Club Náutico',
    esClub: embarcacion.socio == null,
    estadoBaja: embarcacion.fechaFin ? 'inactiva' : 'activa',
    reservasInfraestructura: embarcacion.reservasInfraestructura ?? [],
  };
}



export default AdministrarEmbarcacionesSocios
