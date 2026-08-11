import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import { useEffect, useState } from 'react'
import { getCuotasPorSocio } from '../api/cuotas'
import { getAfiliaciones } from '../api/afiliaciones'
import { getEmbarcacionesActivasPorSocio } from '../api/embarcaciones'

export default function SocioHome({ idSocio, onSeleccion }) {
  const [cuotas, setCuotas] = useState([])
  const [afiliacion, setAfiliacion] = useState(null)
  const [embarcaciones, setEmbarcaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!idSocio) return

    const fetchData = async () => {
      try {
        const safe = (fn) => fn.catch(() => ({ data: { data: [] } })) 
        const [cuotasRes, afiliacionesRes, embarcacionesRes] = await Promise.all([
          safe(getCuotasPorSocio(idSocio)),
          safe(getAfiliaciones()),
          safe(getEmbarcacionesActivasPorSocio(idSocio)),
        ])

        setCuotas(cuotasRes.data?.data || [])

        const afiliacionesSocio = afiliacionesRes.data?.data?.filter(
          (a) => a.socio?.id === idSocio
        ) || []

        const afiliacionActiva = afiliacionesSocio.find((a) => !a.fechaFin)
        setAfiliacion(afiliacionActiva || null)

        setEmbarcaciones(embarcacionesRes.data?.data || [])
      } catch (err) {
        console.error('❌ Error cargando datos del socio:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [idSocio])

  if (loading) return <p>Cargando datos del socio...</p>

  const pagadas = cuotas.filter((c) => c.pagada).length
  const impagas = cuotas.filter((c) => !c.pagada).length
  const proximoVto = cuotas
    .filter((c) => !c.pagada && c.fechaVencimiento)
    .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))[0]

  const tipoConteo = embarcaciones.reduce((acc, e) => {
    const tipo = e.tipoEmbarcacion?.nombre || 'Sin tipo'
    acc[tipo] = (acc[tipo] || 0) + 1
    return acc
  }, {})

  return (
    <div className="socio-container p-4">
      <h1 className="socio-title mb-4 fw-bold">Panel de Socio</h1>

      <CRow className="g-4">

        <CCol xs={12} sm={6} md={3}>
          <CCard className="socio-card text-start">
            <CCardBody>
              <CCardTitle className="fw-bold">Cuotas</CCardTitle>
              <CCardText><span className="fw-bold">Pagadas:</span> {pagadas}</CCardText>
              <CCardText><span className="fw-bold">Impagas:</span> {impagas}</CCardText>
              <CCardText>
                <span className="fw-bold">Próximo vencimiento:</span>{' '}
                {proximoVto?.fechaVencimiento
                  ? new Date(proximoVto.fechaVencimiento).toLocaleDateString()
                  : 'Sin pendientes'}
              </CCardText>
              <CButton color="info" variant="outline" onClick={() => onSeleccion('cuotas')}>
                Historial
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>


        <CCol xs={12} sm={6} md={3}>
          <CCard className="socio-card text-start">
            <CCardBody>
              <CCardTitle className="fw-bold">Tipos de embarcaciones</CCardTitle>
              {Object.keys(tipoConteo).length === 0 ? (
                <CCardText>No tenés embarcaciones</CCardText>
              ) : (
                Object.entries(tipoConteo).map(([tipo, cant]) => (
                  <CCardText key={tipo}>
                    <span className="fw-bold">{cant}</span> {tipo}
                  </CCardText>
                ))
              )}
              <CButton color="info" variant="outline" onClick={() => onSeleccion('embarcaciones')}>
                Ver embarcaciones
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>


        <CCol xs={12} sm={6} md={3}>
          <CCard className="socio-card text-start">
            <CCardBody>
              <CCardTitle className="fw-bold"> Afiliación</CCardTitle>
              <CCardText>
                <span className="fw-bold">Estado:</span>{' '}
                {!afiliacion?.fechaFin ? (
                  <span style={{ color: 'green' }}>Activa</span>
                ) : (
                  <span style={{ color: 'red' }}>Inactiva</span>
                )}
              </CCardText>
              <CCardText>
                <span className="fw-bold">Fecha de inicio:</span>{' '}
                {afiliacion?.fechaInicio
                  ? new Date(afiliacion.fechaInicio).toLocaleDateString()
                  : '-'}
              </CCardText>
              <CCardText>
                <span className="fw-bold">Tipo:</span> {afiliacion?.tipo || '-'}
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}
