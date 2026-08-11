import React, { useEffect, useState } from 'react'
/*
import {
  CButton,
  CCollapse,
  CSmartTable,
  CCard,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
} from '@coreui/react-pro'

import {
  getEmbarcacionesActivasPorSocio,
  getEmbarcacionesClub,
  crearEmbarcacion,
  eliminarEmbarcacion,
} from '../api/embarcaciones.js'
import {
  getReservasInfraestructura,
  crearReservaInfraestructura,
  finalizarReservaInfraestructura,
} from '../api/reservasInfraestructura.js'
import { getSocios } from '../api/socios.js'
import { getTiposEmbarcacion } from '../api/tiposEmbarcacion.js'
import { getAmarras } from '../api/amarras.js'
import { getBoxes } from '../api/boxes.js'

const AdministrarEmbarcacionesSocios = () => {
  const [socios, setSocios] = useState([])
  const [details, setDetails] = useState([])
  const [embarcacionesPorSocio, setEmbarcacionesPorSocio] = useState({})
  const [embarcacionesClub, setEmbarcacionesClub] = useState([])
  const [loadingSocios, setLoadingSocios] = useState(true)
  const [loadingEmbarcaciones, setLoadingEmbarcaciones] = useState({})
  const [loadingClub, setLoadingClub] = useState(false)
  const [modalNuevaVisible, setModalNuevaVisible] = useState(false)
  const [socioSeleccionado, setSocioSeleccionado] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    matricula: '',
    eslora: '',
    tipoEmbarcacion: '',
  })
  const [tiposEmbarcacion, setTiposEmbarcacion] = useState([])

  const [tipoUbicacion, setTipoUbicacion] = useState('amarra')
  const [ubicacionId, setUbicacionId] = useState('')
  const [amarrasDisponibles, setAmarrasDisponibles] = useState([])
  const [boxesDisponibles, setBoxesDisponibles] = useState([])

  const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
  const [embarcacionAEliminar, setEmbarcacionAEliminar] = useState(null) // { id, socioId }

  const [reservasActivasPorEmbarcacion, setReservasActivasPorEmbarcacion] = useState({})

  const [modalCambioVisible, setModalCambioVisible] = useState(false)
  const [embarcacionCambio, setEmbarcacionCambio] = useState(null) // {id, socioId}
  const [tipoUbicacionCambio, setTipoUbicacionCambio] = useState('amarra')
  const [ubicacionCambioId, setUbicacionCambioId] = useState('')
  const [guardandoCambio, setGuardandoCambio] = useState(false)

  const esReservaActiva = (reserva) => reserva?.estado === 'ACTIVA' && !reserva?.fechaFin

  const cargarReservasActivas = async () => {
    try {
      const resp = await getReservasInfraestructura()
      const reservas = resp?.data?.data ?? []
      const activas = reservas.filter(esReservaActiva)
      const map = {}
      activas.forEach((r) => {
        if (r?.embarcacion?.id) {
          map[r.embarcacion.id] = r
        }
      })
      setReservasActivasPorEmbarcacion(map)
    } catch (error) {
      console.error('Error cargando reservas activas:', error)
      setReservasActivasPorEmbarcacion({})
    }
  }

  const cargarUbicacionesDisponibles = async () => {
    try {
      const [respAmarras, respBoxes] = await Promise.all([getAmarras(), getBoxes()])
      const todasAmarras = respAmarras?.data?.data ?? []
      const todosBoxes = respBoxes?.data?.data ?? []
      setAmarrasDisponibles(todasAmarras.filter((a) => a.estado === 'libre'))
      setBoxesDisponibles(todosBoxes.filter((b) => b.estado === 'disponible'))
    } catch (error) {
      console.error('Error al cargar ubicaciones disponibles:', error)
    }
  }

  useEffect(() => {
    const fetchSocios = async () => {
      try {
        const resp = await getSocios()
        const arr = resp?.data?.data ?? resp?.data ?? []
        setSocios(Array.isArray(arr) ? arr : [])
      } catch (error) {
        console.error('Error cargando socios:', error)
      } finally {
        setLoadingSocios(false)
      }
    }
    fetchSocios()
  }, [])

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const resp = await getTiposEmbarcacion()
        const arr = resp?.data?.data ?? resp?.data ?? []
        setTiposEmbarcacion(arr)
      } catch (error) {
        console.error('Error al obtener tipos de embarcación:', error)
      }
    }
    fetchTipos()
  }, [])

  const cargarEmbarcacionesClub = async () => {
    setLoadingClub(true)
    try {
      const resp = await getEmbarcacionesClub()
      const arr = resp?.data?.data ?? []
      setEmbarcacionesClub(arr)
    } catch (error) {
      console.error('Error obteniendo embarcaciones del club:', error)
    } finally {
      setLoadingClub(false)
    }
  }

  const cargarEmbarcacionesSocio = async (idSocio) => {
    setLoadingEmbarcaciones((prev) => ({ ...prev, [idSocio]: true }))
    try {
      const resp = await getEmbarcacionesActivasPorSocio(idSocio)
      const arr = resp?.data?.data ?? []
      setEmbarcacionesPorSocio((prev) => ({ ...prev, [idSocio]: arr }))
    } catch (error) {
      console.error('Error obteniendo embarcaciones del socio:', error)
      setEmbarcacionesPorSocio((prev) => ({ ...prev, [idSocio]: [] }))
    } finally {
      setLoadingEmbarcaciones((prev) => ({ ...prev, [idSocio]: false }))
    }
  }

  useEffect(() => {
    const init = async () => {
      await Promise.all([cargarEmbarcacionesClub(), cargarReservasActivas()])
    }
    init()
  }, [])

  useEffect(() => {
    if (modalNuevaVisible || modalCambioVisible) {
      cargarUbicacionesDisponibles()
    }
  }, [modalNuevaVisible, modalCambioVisible])

  const toggleDetails = async (idSocio) => {
    const isOpen = details.includes(idSocio)
    const newDetails = isOpen ? details.filter((i) => i !== idSocio) : [...details, idSocio]
    setDetails(newDetails)

    if (!isOpen && !embarcacionesPorSocio[idSocio]) {
      await cargarEmbarcacionesSocio(idSocio)
    }
  }

  const borrarEmbarcacion = async (idEmbarcacion, socioId = null) => {
    try {
      await eliminarEmbarcacion(idEmbarcacion)
      if (socioId) {
        await cargarEmbarcacionesSocio(socioId)
      } else {
        await cargarEmbarcacionesClub()
      }
      await cargarReservasActivas()
    } catch (error) {
      console.error('Error al eliminar embarcación:', error)
      const mensaje = error.response?.data?.message || 'Error al eliminar la embarcación'
      alert(mensaje)
    }
  }

  const abrirConfirmarEliminar = (idEmbarcacion, socioId = null) => {
    setEmbarcacionAEliminar({ id: idEmbarcacion, socioId })
    setModalEliminarVisible(true)
  }

  const confirmarEliminar = async () => {
    if (!embarcacionAEliminar) return
    await borrarEmbarcacion(embarcacionAEliminar.id, embarcacionAEliminar.socioId)
    setModalEliminarVisible(false)
    setEmbarcacionAEliminar(null)
  }

  const abrirModalNueva = (socioId) => {
    setSocioSeleccionado(socioId)
    setFormData({
      nombre: '',
      matricula: '',
      eslora: '',
      tipoEmbarcacion: '',
    })
    setTipoUbicacion('amarra')
    setUbicacionId('')
    setModalNuevaVisible(true)
  }

  const abrirModalCambioUbicacion = (embarcacionId, socioId) => {
    const reservaActiva = reservasActivasPorEmbarcacion[embarcacionId]
    setEmbarcacionCambio({ id: embarcacionId, socioId })
    setTipoUbicacionCambio(reservaActiva?.box ? 'box' : 'amarra')
    setUbicacionCambioId('')
    setModalCambioVisible(true)
  }

  const guardarNueva = async () => {
    if (!formData.nombre || !formData.matricula || !formData.eslora || !formData.tipoEmbarcacion) {
      alert('Complete todos los campos')
      return
    }
    if (!ubicacionId) {
      alert('Debe seleccionar una ubicación (amarra o box)')
      return
    }

    const payload = {
      nombre: formData.nombre,
      matricula: formData.matricula,
      eslora: Number(formData.eslora),
      tipoEmbarcacion: formData.tipoEmbarcacion,
      socio: socioSeleccionado,
    }

    if (tipoUbicacion === 'amarra') {
      payload.amarra = Number(ubicacionId)
    } else if (tipoUbicacion === 'box') {
      payload.box = Number(ubicacionId)
    }

    try {
      await crearEmbarcacion(payload)
      if (socioSeleccionado) {
        await cargarEmbarcacionesSocio(socioSeleccionado)
      } else {
        await cargarEmbarcacionesClub()
      }
      await cargarReservasActivas()
      setModalNuevaVisible(false)
      setSocioSeleccionado(null)
    } catch (error) {
      console.error('Error al crear embarcación:', error)
      const data = error.response?.data
      const mensaje = data?.errors?.join('\n') || data?.message || 'Error al crear la embarcación'
      alert(mensaje)
    }
  }

  const guardarCambioUbicacion = async () => {
    if (!embarcacionCambio) return
    if (!ubicacionCambioId) {
      alert('Debe seleccionar la nueva ubicación')
      return
    }

    setGuardandoCambio(true)
    try {
      const reservaActiva = reservasActivasPorEmbarcacion[embarcacionCambio.id]

      if (reservaActiva?.id) {
        await finalizarReservaInfraestructura(reservaActiva.id)
      }

      const payload = {
        embarcacion: embarcacionCambio.id,
        socio: embarcacionCambio.socioId ?? null,
        estado: 'ACTIVA',
        fechaInicio: new Date().toISOString(),
      }
      if (tipoUbicacionCambio === 'amarra') {
        payload.amarra = Number(ubicacionCambioId)
      } else {
        payload.box = Number(ubicacionCambioId)
      }

      await crearReservaInfraestructura(payload)

      if (embarcacionCambio.socioId) {
        await cargarEmbarcacionesSocio(embarcacionCambio.socioId)
      } else {
        await cargarEmbarcacionesClub()
      }
      await cargarReservasActivas()
      await cargarUbicacionesDisponibles()
      setModalCambioVisible(false)
      setEmbarcacionCambio(null)
    } catch (error) {
      console.error('Error al cambiar ubicación:', error)
      const mensaje = error.response?.data?.message || 'Error al cambiar la ubicación de la embarcación'
      alert(mensaje)
    } finally {
      setGuardandoCambio(false)
    }
  }

  const getUbicacionActualTexto = (embarcacionId) => {
    const reserva = reservasActivasPorEmbarcacion[embarcacionId]
    if (!reserva) return 'Sin ubicación activa'
    if (reserva.amarra) {
      return `Amarra #${reserva.amarra.id} (${reserva.amarra.zona ?? 's/zona'})`
    }
    if (reserva.box) {
      return `Box ${reserva.box.nroBox ?? reserva.box.id}`
    }
    return 'Sin ubicación activa'
  }

  const columns = [
    { key: 'id', label: 'ID', _style: { width: '10%' } },
    { key: 'nombreCompleto', label: 'Socio', _style: { width: '70%' } },
    { key: 'show_details', label: '', _style: { width: '1%' } },
  ]

  if (loadingSocios) {
    return (
      <CCard className="p-3 text-center mx-auto" style={{ maxWidth: '900px' }}>
        <CSpinner color="primary" />
        <p>Cargando socios...</p>
      </CCard>
    )
  }

  const sociosConNombreCompleto = socios.map((s) => ({
    ...s,
    nombreCompleto: `${s.nombre} ${s.apellido}`,
  }))

  return (
    <CCard className="rounded shadow-sm p-3 mx-auto" style={{ maxWidth: '900px' }}>
      <div className="mb-4 border-bottom pb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5>Embarcaciones del Club</h5>
          <CButton color="primary" onClick={() => abrirModalNueva(null)}>
            Nueva embarcación del club
          </CButton>
        </div>

        {loadingClub ? (
          <div className="text-center mt-3">
            <CSpinner color="primary" />
          </div>
        ) : embarcacionesClub.length === 0 ? (
          <p className="text-muted mt-3">No hay embarcaciones registradas del club.</p>
        ) : (
          <table className="table table-sm table-bordered mt-3">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Matrícula</th>
                <th>Eslora</th>
                <th>Tipo</th>
                <th>Ubicación actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {embarcacionesClub.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{e.matricula}</td>
                  <td>{e.eslora}</td>
                  <td>{e.tipoEmbarcacion?.nombre ?? '---'}</td>
                  <td>{getUbicacionActualTexto(e.id)}</td>
                  <td className="d-flex gap-2">
                    <CButton color="info" size="sm" onClick={() => abrirModalCambioUbicacion(e.id, null)}>
                      Cambiar ubicación
                    </CButton>
                    <CButton color="danger" size="sm" onClick={() => abrirConfirmarEliminar(e.id)}>
                      Eliminar
                    </CButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CSmartTable
        columns={columns}
        items={sociosConNombreCompleto}
        itemsPerPage={20}
        pagination
        sorter={true}
        scopedColumns={{
          show_details: (item) => (
            <td className="py-2">
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                style={{ minWidth: '140px' }}
                onClick={() => toggleDetails(item.id)}
              >
                {details.includes(item.id) ? 'Ocultar' : 'Ver embarcaciones'}
              </CButton>
            </td>
          ),
          details: (item) => {
            const embarcaciones = embarcacionesPorSocio[item.id] || []
            const loading = loadingEmbarcaciones[item.id]
            return (
              <CCollapse visible={details.includes(item.id)}>
                <div className="p-3 border-start border-primary">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Embarcaciones de {item.nombre} {item.apellido}</h6>
                    <CButton size="sm" color="success" onClick={() => abrirModalNueva(item.id)}>
                      Nueva embarcación
                    </CButton>
                  </div>
                  {loading ? (
                    <CSpinner size="sm" color="primary" />
                  ) : embarcaciones.length === 0 ? (
                    <p className="text-muted">No hay embarcaciones registradas.</p>
                  ) : (
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Nombre</th>
                          <th>Matrícula</th>
                          <th>Eslora</th>
                          <th>Tipo</th>
                          <th>Ubicación actual</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {embarcaciones.map((e) => (
                          <tr key={e.id}>
                            <td>{e.nombre}</td>
                            <td>{e.matricula}</td>
                            <td>{e.eslora}</td>
                            <td>{e.tipoEmbarcacion?.nombre ?? '---'}</td>
                            <td>{getUbicacionActualTexto(e.id)}</td>
                            <td className="d-flex gap-2">
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => abrirModalCambioUbicacion(e.id, item.id)}
                              >
                                Cambiar ubicación
                              </CButton>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => abrirConfirmarEliminar(e.id, item.id)}
                              >
                                Eliminar
                              </CButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CCollapse>
            )
          },
        }}
      />

      <CModal visible={modalNuevaVisible} onClose={() => setModalNuevaVisible(false)}>
        <CModalHeader closeButton>Nueva embarcación</CModalHeader>
        <CModalBody>
          <CFormInput
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
            className="mb-3"
          />
          <CFormInput
            label="Matrícula"
            value={formData.matricula}
            onChange={(e) => setFormData((prev) => ({ ...prev, matricula: e.target.value }))}
            className="mb-3"
          />
          <CFormInput
            label="Eslora (en metros)"
            type="number"
            value={formData.eslora}
            onChange={(e) => setFormData((prev) => ({ ...prev, eslora: e.target.value }))}
            className="mb-3"
          />
          <CFormSelect
            label="Tipo de embarcación"
            value={formData.tipoEmbarcacion}
            onChange={(e) => setFormData((prev) => ({ ...prev, tipoEmbarcacion: e.target.value }))}
            className="mb-3"
          >
            <option value="">Seleccione un tipo</option>
            {tiposEmbarcacion.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </CFormSelect>

          <CFormSelect
            label="Ubicación"
            value={tipoUbicacion}
            onChange={(e) => {
              setTipoUbicacion(e.target.value)
              setUbicacionId('')
            }}
            className="mb-3"
          >
            <option value="amarra">Amarra</option>
            <option value="box">Box</option>
          </CFormSelect>

          {tipoUbicacion === 'amarra' && (
            <CFormSelect
              label="Amarra disponible"
              value={ubicacionId}
              onChange={(e) => setUbicacionId(e.target.value)}
              className="mb-3"
            >
              <option value="">Seleccione una amarra</option>
              {amarrasDisponibles.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} — Zona {a.zona}, pilón {a.nroPilon} — ${a.precioMensualBase}/mes
                </option>
              ))}
            </CFormSelect>
          )}

          {tipoUbicacion === 'box' && (
            <CFormSelect
              label="Box disponible"
              value={ubicacionId}
              onChange={(e) => setUbicacionId(e.target.value)}
              className="mb-3"
            >
              <option value="">Seleccione un box</option>
              {boxesDisponibles.map((b) => (
                <option key={b.id} value={b.id}>
                  Box {b.nroBox} — ${b.precioMensualBase}/mes
                </option>
              ))}
            </CFormSelect>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalNuevaVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" onClick={guardarNueva}>
            Crear
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={modalCambioVisible} onClose={() => setModalCambioVisible(false)}>
        <CModalHeader closeButton>Cambiar ubicación de embarcación</CModalHeader>
        <CModalBody>
          {embarcacionCambio && (
            <p className="mb-3">
              Ubicación actual: <strong>{getUbicacionActualTexto(embarcacionCambio.id)}</strong>
            </p>
          )}
          <CFormSelect
            label="Nueva ubicación"
            value={tipoUbicacionCambio}
            onChange={(e) => {
              setTipoUbicacionCambio(e.target.value)
              setUbicacionCambioId('')
            }}
            className="mb-3"
          >
            <option value="amarra">Amarra</option>
            <option value="box">Box</option>
          </CFormSelect>

          {tipoUbicacionCambio === 'amarra' && (
            <CFormSelect
              label="Amarra disponible"
              value={ubicacionCambioId}
              onChange={(e) => setUbicacionCambioId(e.target.value)}
            >
              <option value="">Seleccione una amarra</option>
              {amarrasDisponibles.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.id} — Zona {a.zona}, pilón {a.nroPilon}
                </option>
              ))}
            </CFormSelect>
          )}
          {tipoUbicacionCambio === 'box' && (
            <CFormSelect
              label="Box disponible"
              value={ubicacionCambioId}
              onChange={(e) => setUbicacionCambioId(e.target.value)}
            >
              <option value="">Seleccione un box</option>
              {boxesDisponibles.map((b) => (
                <option key={b.id} value={b.id}>
                  Box {b.nroBox}
                </option>
              ))}
            </CFormSelect>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalCambioVisible(false)} disabled={guardandoCambio}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={guardarCambioUbicacion} disabled={guardandoCambio}>
            {guardandoCambio ? 'Guardando...' : 'Guardar cambio'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={modalEliminarVisible} onClose={() => setModalEliminarVisible(false)}>
        <CModalHeader closeButton>Confirmar eliminación</CModalHeader>
        <CModalBody>
          ¿Estás seguro de que querés eliminar esta embarcación? Esta acción no se puede deshacer.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalEliminarVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmarEliminar}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}
*/
import {
  getEmbarcaciones,
  actualizarEmbarcacion,
  eliminarEmbarcacion,
  cambiarUbicacionEmbarcacion,
} from '../api/embarcaciones.js';
import { getAmarras } from '../api/amarras.js';
import { getBoxes } from '../api/boxes.js';
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
import { EntityTable } from '../components/TablaGenerica.jsx';

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
      <h2 className="mb-4">Administración de Embarcaciones</h2>

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

