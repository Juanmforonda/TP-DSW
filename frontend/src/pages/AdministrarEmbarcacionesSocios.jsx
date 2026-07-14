import React, { useEffect, useState } from 'react'
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
  getEmbarcacionesPorSocio,
  getEmbarcacionesClub,
  crearEmbarcacion,
  eliminarEmbarcacion,
} from '../api/embarcaciones.js'
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

  // 🔹 Ubicación (amarra o box) para la embarcación nueva. Son mutuamente
  // excluyentes: solo se puede elegir una de las dos, o ninguna.
  const [tipoUbicacion, setTipoUbicacion] = useState('ninguna') // 'ninguna' | 'amarra' | 'box'
  const [ubicacionId, setUbicacionId] = useState('')
  const [amarrasDisponibles, setAmarrasDisponibles] = useState([])
  const [boxesDisponibles, setBoxesDisponibles] = useState([])

  // 🔹 Confirmación antes de eliminar una embarcación
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
  const [embarcacionAEliminar, setEmbarcacionAEliminar] = useState(null) // { id, socioId }

  // 🔹 Cargar socios
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

  // 🔹 Cargar tipos de embarcación
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

  // 🔹 Cargar embarcaciones del club
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

  useEffect(() => {
    cargarEmbarcacionesClub()
  }, [])

  // 🔹 Cargar amarras y boxes disponibles cada vez que se abre el modal de creación
  useEffect(() => {
    if (modalNuevaVisible) {
      getAmarras()
        .then((resp) => {
          const todas = resp?.data?.data ?? []
          setAmarrasDisponibles(todas.filter((a) => a.estado === 'libre'))
        })
        .catch((error) => console.error('Error al cargar amarras:', error))

      getBoxes()
        .then((resp) => {
          const todos = resp?.data?.data ?? []
          setBoxesDisponibles(todos.filter((b) => b.estado === 'disponible'))
        })
        .catch((error) => console.error('Error al cargar boxes:', error))
    }
  }, [modalNuevaVisible])

  // 🔹 Mostrar embarcaciones del socio
  const toggleDetails = async (idSocio) => {
    const isOpen = details.includes(idSocio)
    const newDetails = isOpen ? details.filter((i) => i !== idSocio) : [...details, idSocio]
    setDetails(newDetails)

    if (!isOpen && !embarcacionesPorSocio[idSocio]) {
      setLoadingEmbarcaciones((prev) => ({ ...prev, [idSocio]: true }))
      try {
        const resp = await getEmbarcacionesPorSocio(idSocio)
        const arr = resp?.data?.data ?? []
        setEmbarcacionesPorSocio((prev) => ({ ...prev, [idSocio]: arr }))
      } catch (error) {
        console.error('Error obteniendo embarcaciones del socio:', error)
        setEmbarcacionesPorSocio((prev) => ({ ...prev, [idSocio]: [] }))
      } finally {
        setLoadingEmbarcaciones((prev) => ({ ...prev, [idSocio]: false }))
      }
    }
  }

  // 🔹 Eliminar embarcación
  const borrarEmbarcacion = async (idEmbarcacion, socioId = null) => {
    try {
      await eliminarEmbarcacion(idEmbarcacion)
      if (socioId) {
        setEmbarcacionesPorSocio((prev) => ({
          ...prev,
          [socioId]: prev[socioId]?.filter((e) => e.id !== idEmbarcacion),
        }))
      } else {
        setEmbarcacionesClub((prev) => prev.filter((e) => e.id !== idEmbarcacion))
      }
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

  // 🔹 Modal nueva embarcación
  const abrirModalNueva = (socioId) => {
    setSocioSeleccionado(socioId)
    setFormData({
      nombre: '',
      matricula: '',
      eslora: '',
      tipoEmbarcacion: '',
    })
    setTipoUbicacion('ninguna')
    setUbicacionId('')
    setModalNuevaVisible(true)
  }

  const guardarNueva = async () => {
    if (!formData.nombre || !formData.matricula || !formData.eslora || !formData.tipoEmbarcacion) {
      alert('Complete todos los campos')
      return
    }

    const payload = {
      nombre: formData.nombre,
      matricula: formData.matricula,
      eslora: Number(formData.eslora),
      tipoEmbarcacion: formData.tipoEmbarcacion,
      socio: socioSeleccionado, // puede ser null para el club
    }

    // La embarcación puede ir en una amarra O en un box, nunca en ambos.
    if (tipoUbicacion === 'amarra' && ubicacionId) {
      payload.amarra = Number(ubicacionId)
    } else if (tipoUbicacion === 'box' && ubicacionId) {
      payload.box = Number(ubicacionId)
    }

    try {
      const resp = await crearEmbarcacion(payload)
      const creada = resp?.data?.data ?? payload

      if (socioSeleccionado) {
        setEmbarcacionesPorSocio((prev) => {
          const list = prev[socioSeleccionado] || []
          return { ...prev, [socioSeleccionado]: [...list, creada] }
        })
      } else {
        setEmbarcacionesClub((prev) => [...prev, creada])
      }

      setModalNuevaVisible(false)
      setSocioSeleccionado(null)
    } catch (error) {
      console.error('Error al crear embarcación:', error)
      const data = error.response?.data
      const mensaje = data?.errors?.join('\n') || data?.message || 'Error al crear la embarcación'
      alert(mensaje)
    }
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
      {/* 🔹 Sección de embarcaciones del club */}
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
                  <td>
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

      {/* 🔹 Sección de embarcaciones por socio */}
      <CSmartTable
        columns={columns}
        items={sociosConNombreCompleto}
        itemsPerPage={20}
        pagination
        sorter={true} // ✅ corregido: booleano válido
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
                            <td>
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

      {/* 🔹 Modal Nueva Embarcación */}
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
            <option value="ninguna">Sin asignar</option>
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

      {/* 🔹 Confirmación de borrado de embarcación */}
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

export default AdministrarEmbarcacionesSocios
