import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCollapse,
  CSmartTable,
  CCard,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react-pro'
import { getSocios } from '../../api/socios.js'
import { getAfiliaciones, actualizarAfiliacion, crearAfiliacion } from '../../api/afiliaciones.js'

export const AdministrarAfiliaciones = () => {
  const [details, setDetails] = useState([])
  const [socios, setSocios] = useState([])
  const [afiliacionesPorSocio, setAfiliacionesPorSocio] = useState({})
  const [loadingAfiliaciones, setLoadingAfiliaciones] = useState({})
  const [errorSocios, setErrorSocios] = useState(false)
  const [loadingSocios, setLoadingSocios] = useState(true)

  // modal editar
  const [modalVisible, setModalVisible] = useState(false)
  const [afiliacionEditando, setAfiliacionEditando] = useState(null)
  const [editingSocioId, setEditingSocioId] = useState(null)
  const [formData, setFormData] = useState({ tipo: '', estado: 'activa' })

  // modal nueva afiliacion
  const [modalNuevaVisible, setModalNuevaVisible] = useState(false)
  const [socioSeleccionado, setSocioSeleccionado] = useState(null)
  const [nuevoTipo, setNuevoTipo] = useState('')

  useEffect(() => {
    const fetchSocios = async () => {
      try {
        const resp = await getSocios()
        const arr = resp?.data?.data ?? resp?.data
        if (Array.isArray(arr)) {
          const filtrados = arr.filter((s) => s.id && s.nombre && s.apellido)
          setSocios(filtrados)
        } else {
          setErrorSocios(true)
        }
      } catch (error) {
        console.error('Error al cargar socios:', error)
        setErrorSocios(true)
      } finally {
        setLoadingSocios(false)
      }
    }
    fetchSocios()
  }, [])

  const toggleDetails = async (id) => {
    const isOpen = details.includes(id)
    const newDetails = isOpen ? details.filter((i) => i !== id) : [...details, id]
    setDetails(newDetails)

    if (!afiliacionesPorSocio[id] && !isOpen) {
      setLoadingAfiliaciones((prev) => ({ ...prev, [id]: true }))
      try {
        const resp = await getAfiliaciones()
        const todas = resp?.data?.data ?? []
        const afiliacionesDelSocio = todas.filter((a) => a.socio?.id === id)
        setAfiliacionesPorSocio((prev) => ({ ...prev, [id]: afiliacionesDelSocio }))
      } catch (error) {
        console.error(`Error al obtener afiliaciones para socio ${id}:`, error)
        setAfiliacionesPorSocio((prev) => ({ ...prev, [id]: [] }))
      } finally {
        setLoadingAfiliaciones((prev) => ({ ...prev, [id]: false }))
      }
    }
  }

  const abrirModalEditar = (afiliacion, socioId) => {
    setAfiliacionEditando(afiliacion)
    setEditingSocioId(socioId)
    setFormData({
      tipo: afiliacion.tipo ?? '',
      estado: afiliacion.fechaFin ? 'finalizada' : 'activa',
    })
    setModalVisible(true)
  }

  const guardarCambios = async () => {
    if (!afiliacionEditando) return
    const payload = {
      tipo: formData.tipo,
      fechaFin: formData.estado === 'finalizada' ? new Date().toISOString() : null,
    }

    try {
      const resp = await actualizarAfiliacion(afiliacionEditando.id, payload)
      const updated = resp?.data?.data ?? { ...afiliacionEditando, ...payload }

      setAfiliacionesPorSocio((prev) => {
        const list = prev[editingSocioId] || []
        const newList = list.map((a) => (a.id === updated.id ? { ...a, ...updated } : a))
        return { ...prev, [editingSocioId]: newList }
      })

      setModalVisible(false)
      setAfiliacionEditando(null)
      setEditingSocioId(null)
    } catch (error) {
      console.error('Error al actualizar afiliación:', error)
    }
  }

  const abrirModalNueva = (socioId) => {
    setSocioSeleccionado(socioId)
    setNuevoTipo('')
    setModalNuevaVisible(true)
  }

  const guardarNueva = async () => {
    if (!socioSeleccionado || !nuevoTipo.trim()) return
    const payload = {
      fechaInicio: new Date().toISOString(),
      fechaFin: null,
      tipo: nuevoTipo,
      socio: socioSeleccionado,
    }

    try {
      const resp = await crearAfiliacion(payload)
      const creada = resp?.data?.data ?? payload

      setAfiliacionesPorSocio((prev) => {
        const list = prev[socioSeleccionado] || []
        return { ...prev, [socioSeleccionado]: [...list, creada] }
      })

      setModalNuevaVisible(false)
      setSocioSeleccionado(null)
    } catch (error) {
      console.error('Error al crear afiliación:', error)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', _style: { width: '10%' }, sorter: true },
    {
      key: 'nombreCompleto',
      label: 'Nombre completo',
      _style: { width: '60%' },
      sorter: true,
      filter: false,
    },
    { key: 'show_details', label: '', _style: { width: '1%' }, filter: false, sorter: false },
  ]

  if (errorSocios) {
    return (
      <CCard className="rounded shadow-sm p-3 mx-auto" style={{ maxWidth: '900px' }}>
        <p className="text-danger">No se pudieron cargar los socios. Verificá la API.</p>
      </CCard>
    )
  }

  if (loadingSocios) {
    return (
      <CCard className="rounded shadow-sm p-3 mx-auto text-center" style={{ maxWidth: '900px' }}>
        <CSpinner color="primary" />
        <p className="mt-2">Cargando socios...</p>
      </CCard>
    )
  }

  const sociosConNombreCompleto = socios.map((s) => ({
    ...s,
    nombreCompleto: `${s.nombre} ${s.apellido}`,
  }))

  return (
    <CCard className="rounded shadow-sm p-3 mx-auto" style={{ maxWidth: '900px' }}>
      <CSmartTable
        columns={columns}
        items={sociosConNombreCompleto}
        itemsPerPage={6}
        pagination
        tableFilter
        sorter
        scopedColumns={{
          nombreCompleto: (item) => <td>{item.nombreCompleto}</td>,
          show_details: (item) => (
            <td className="py-2">
              <CButton
                color="primary"
                variant="outline"
                shape="square"
                size="sm"
                onClick={() => toggleDetails(item.id)}
              >
                {details.includes(item.id) ? 'Ocultar' : 'Ver'}
              </CButton>
            </td>
          ),
          details: (item) => {
            const afiliaciones = afiliacionesPorSocio[item.id] || []
            const loading = loadingAfiliaciones[item.id]

            return (
              <CCollapse visible={details.includes(item.id)}>
                <div className="p-2 border-start border-primary">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {afiliaciones.some((a) => a.fechaFin === null) ? (
                        <CButton size="sm" color="secondary" disabled>
                        Afiliación activa
                        </CButton>
                         ) : (
                        <CButton size="sm" color="success" onClick={() => abrirModalNueva(item.id)}>
                        Nueva afiliación
                        </CButton>
                    )}
                  </div>

                  {loading ? (
                    <CSpinner size="sm" color="primary" />
                  ) : afiliaciones.length === 0 ? (
                    <p className="text-muted">No hay afiliaciones para mostrar.</p>
                  ) : (
                    <table className="table table-sm table-bordered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha Inicio</th>
                          <th>Fecha Fin</th>
                          <th>Tipo</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {afiliaciones.slice().reverse().map((a) => (
                          <tr key={a.id}>
                            <td>{a.fechaInicio ? new Date(a.fechaInicio).toLocaleDateString() : '---'}</td>
                            <td>{a.fechaFin ? new Date(a.fechaFin).toLocaleDateString() : '---'}</td>
                            <td>{a.tipo}</td>
                            <td>
                              {a.fechaFin ? (
                                <CBadge color="danger">Finalizada</CBadge>
                              ) : (
                                <CBadge color="success">Activa</CBadge>
                              )}
                            </td>
                            <td>
                              <CButton size="sm" color="warning" onClick={() => abrirModalEditar(a, item.id)}>
                                Modificar
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

      {/* Modal editar afiliacion */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader closeButton>Modificar afiliación</CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={formData.tipo}
              onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="" disabled>Seleccione un tipo</option>
              <option value="Básica">Básica</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-select"
              value={formData.estado}
              onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.value }))}
            >
              <option value="activa">Activa</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
          <CButton color="primary" onClick={guardarCambios}>Guardar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal nueva afiliacion */}
      <CModal visible={modalNuevaVisible} onClose={() => setModalNuevaVisible(false)}>
        <CModalHeader closeButton>Nueva afiliación</CModalHeader>
        <CModalBody>
          <p>La fecha de inicio será hoy ({new Date().toLocaleDateString()})</p>
          <div className="mb-3">
            <label className="form-label">Tipo</label>
            <select
              className="form-select"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
            >
              <option value="">Seleccione un tipo</option>
              <option value="Básica">Básica</option>
            </select>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalNuevaVisible(false)}>Cancelar</CButton>
          <CButton color="success" onClick={guardarNueva} disabled={!nuevoTipo}>Crear</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}
