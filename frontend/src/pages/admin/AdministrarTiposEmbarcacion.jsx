import { useEffect, useState } from 'react'
import {
  getTiposEmbarcacion,
  crearTipoEmbarcacion,
  eliminarTipoEmbarcacion,
  actualizarTipoEmbarcacion,
} from '../../api/tiposEmbarcacion.js'

import { EntityTable } from '../../components/TablaGenerica.jsx'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CButton,
} from '@coreui/react'

export default function AdministrarTiposEmbarcacion() {
  const [tipos, setTipos] = useState([])
  const [nombre, setNombre] = useState('')
  const [esloraMaxima, setEsloraMaxima] = useState('')

  useEffect(() => {
    cargarTipos()
  }, [])

  const cargarTipos = async () => {
    try {
      const res = await getTiposEmbarcacion()
      setTipos(res.data.data)
    } catch (error) {
      console.error('Error al cargar tipos de embarcación:', error)
    }
  }

  const handleCrear = async (e) => {
    e.preventDefault()

    if (!nombre.trim() || !esloraMaxima) {
      alert('Debés completar todos los campos.')
      return
    }

    try {
      await crearTipoEmbarcacion({
        nombre,
        esloraMaxima: parseFloat(esloraMaxima),
      })

      await cargarTipos()
      setNombre('')
      setEsloraMaxima('')
    } catch (error) {
      console.error('Error al crear tipo de embarcación:', error)
      alert('No se pudo crear el tipo de embarcación.')
    }
  }

  const handleEliminar = async (id) => {
    try {
      await eliminarTipoEmbarcacion(id)
      await cargarTipos()
    } catch (error) {
      const message = error.response?.data?.message || ''
      if (message.includes('foreign key')) {
        alert('No se puede eliminar este tipo porque tiene embarcaciones asociadas.')
      } else {
        alert('Error al eliminar el tipo de embarcación.')
      }
    }
  }

  const handleEditar = async (id, tipoEditar) => {
    try {
      await actualizarTipoEmbarcacion(id, tipoEditar)
      await cargarTipos()
    } catch (error) {
      console.error('Error al actualizar tipo de embarcación:', error)
      alert('No se pudo actualizar el tipo de embarcación.')
    }
  }

  return (
    <div className="p-4">
      <CCard>
        <CCardHeader>
          <h4>Crear Tipo de Embarcación</h4>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleCrear}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormInput
                  label="Nombre"
                  placeholder="Ej: Velero, Lancha..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  label="Eslora Máxima (m)"
                  type="number"
                  step="0.1"
                  placeholder="Ej: 15.5"
                  value={esloraMaxima}
                  onChange={(e) => setEsloraMaxima(e.target.value)}
                  required
                />
              </CCol>
            </CRow>
            <CButton color="primary" type="submit">
              Crear Tipo de Embarcación
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

      <div className="mt-4">
        <EntityTable
          entityName="tipo embarcación"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'esloraMaxima', label: 'Eslora Máxima (m)' },
          ]}
          data={tipos}
          onDelete={handleEliminar}
          onEdit={handleEditar}
        />
      </div>
    </div>
  )
}
