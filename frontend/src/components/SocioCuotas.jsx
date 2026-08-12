import { useEffect, useState } from 'react';
import { getCuotasPorSocio } from '../api/cuotas';
import './socioHome.css';
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CBadge,
  CButton,
  CCollapse,
  CFormSwitch,
  CSpinner,
  CAlert,
} from '@coreui/react-pro';

export function SocioCuotas({ idSocio }) {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState({});

  useEffect(() => {
    if (!idSocio) return;

    getCuotasPorSocio(idSocio)
      .then((res) => {
        const data = res.data?.data;
        if (!Array.isArray(data)) throw new Error('Formato inesperado');
        setCuotas(data);
      })
      .catch((err) => {
        console.error(' Error al cargar cuotas:', err);
        setError('Error al cargar cuotas');
      })
      .finally(() => setLoading(false));
  }, [idSocio]);

  const toggleDetalle = (id) => {
    setDetalleAbierto((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hoy = new Date();

  const cuotasOrdenadas = cuotas
    .slice()
    .sort((a, b) => b.anio - a.anio || b.mes - a.mes);

  const cuotasVisibles = soloPendientes
    ? cuotasOrdenadas.filter((c) => !c.pagada)
    : cuotasOrdenadas;

  const pendientes = cuotas.filter((c) => !c.pagada);
  const totalAdeudado = pendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  const estaVencida = (cuota) =>
    !cuota.pagada && new Date(cuota.fechaVencimiento) < hoy;

  const colorEstado = (cuota) => {
    if (cuota.pagada) return 'success';
    if (estaVencida(cuota)) return 'danger';
    return 'warning';
  };

  const textoEstado = (cuota) => {
    if (cuota.pagada) return 'Pagada';
    if (estaVencida(cuota)) return 'Vencida';
    return 'Pendiente';
  };

  return (
    <div className="socio-container">
      <h2 className="socio-title">Mis cuotas</h2>
      <p className="socio-subtitle">Historial de pagos mensuales</p>

      {loading && (
        <div className="text-center p-4">
          <CSpinner color="primary" />
          <p className="mt-2">Cargando cuotas...</p>
        </div>
      )}
      {error && <CAlert color="danger">{error}</CAlert>}

      {!loading && !error && (
        <>
          {pendientes.length > 0 && (
            <CAlert color="warning" className="mb-3">
              Tenés <strong>{pendientes.length}</strong> cuota
              {pendientes.length !== 1 ? 's' : ''} pendiente
              {pendientes.length !== 1 ? 's' : ''}, por un total de{' '}
              <strong>${totalAdeudado.toFixed(2)}</strong>.
            </CAlert>
          )}

          <CFormSwitch
            id="soloPendientes"
            label="Mostrar solo pendientes"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
            className="mb-3"
          />

          {cuotasVisibles.length === 0 && <p>No tenés cuotas para mostrar.</p>}

          <CRow>
            {cuotasVisibles.map((cuota) => (
              <CCol md={6} className="mb-4" key={cuota.id}>
                <CCard className="socio-card shadow-sm">
                  <CCardBody>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0">
                        {cuota.mes}/{cuota.anio}
                      </h5>
                      <CBadge color={colorEstado(cuota)}>
                        {textoEstado(cuota)}
                      </CBadge>
                    </div>

                    <p className="mb-1">
                      <strong>Vencimiento:</strong>{' '}
                      {new Date(cuota.fechaVencimiento).toLocaleDateString()}
                    </p>
                    <p className="mb-1">
                      <strong>Monto:</strong> ${cuota.monto}
                    </p>

                    {cuota.pagada && (
                      <>
                        <p className="mb-1">
                          <strong>Fecha de pago:</strong>{' '}
                          {new Date(cuota.fechaPago).toLocaleDateString()}
                        </p>
                        <p className="mb-1">
                          <strong>Método:</strong>{' '}
                          {cuota.metodoPago === 'mercado_pago'
                            ? 'Mercado Pago'
                            : 'Efectivo'}
                        </p>
                      </>
                    )}

                    {!cuota.pagada && (
                      <div className="mt-2">
                        {/* TODO: botón "Pagar con Mercado Pago" cuando armemos esa integración */}
                      </div>
                    )}

                    {cuota.detalles?.length > 0 && (
                      <div className="mt-2">
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          onClick={() => toggleDetalle(cuota.id)}
                        >
                          {detalleAbierto[cuota.id]
                            ? 'Ocultar detalle'
                            : 'Ver detalle'}
                        </CButton>
                        <CCollapse visible={!!detalleAbierto[cuota.id]}>
                          <ul
                            className="list-unstyled mt-2 mb-0"
                            style={{ fontSize: '0.9rem' }}
                          >
                            {cuota.detalles.map((d) => (
                              <li
                                key={d.id}
                                className="d-flex justify-content-between"
                              >
                                <span>{d.concepto}</span>
                                <span>${d.monto}</span>
                              </li>
                            ))}
                          </ul>
                        </CCollapse>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            ))}
          </CRow>
        </>
      )}
    </div>
  );
}
