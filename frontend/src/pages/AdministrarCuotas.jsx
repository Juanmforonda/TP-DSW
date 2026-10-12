import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCollapse,
  CSmartTable,
  CCard,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CNav,
  CNavItem,
  CNavLink,
  CBadge,
} from '@coreui/react-pro';
import { getSocios } from '../api/socios.js'
import { getCuotas, actualizarCuota, generarCuotas, registrarPagoCuota } from '../api/cuotas.js'
import { getAfiliaciones } from '../api/afiliaciones.js'

export const AdministrarCuotas = () => {
  const [details, setDetails] = useState([]);
  const [socios, setSocios] = useState([]);
  const [afiliaciones, setAfiliaciones] = useState([]);
  const [cuotas, setCuotas] = useState([]);

  const [loadingSocios, setLoadingSocios] = useState(true);
  const [loadingAfiliaciones, setLoadingAfiliaciones] = useState(true);
  const [loadingCuotas, setLoadingCuotas] = useState(true);
  const [error, setError] = useState(false);
  const loading = loadingSocios || loadingAfiliaciones || loadingCuotas;

  const [mostrarSoloImpagas, setMostrarSoloImpagas] = useState({});

  const [vista, setVista] = useState('porSocio'); // 'porSocio' | 'morosos'
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const hoy = new Date(); //generacion masiva de cuotas:
  const [mesGenerar, setMesGenerar] = useState(hoy.getMonth() + 1);
  const [anioGenerar, setAnioGenerar] = useState(hoy.getFullYear());
  const [generando, setGenerando] = useState(false);
  const [mensajeGeneracion, setMensajeGeneracion] = useState(null);

  //marcar pagada
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  const [formPago, setFormPago] = useState({
    metodoPago: 'efectivo',
    fechaPago: hoy.toISOString().slice(0, 10),
  });

  //editar vencimiento
  const [modalVencimientoVisible, setModalVencimientoVisible] = useState(false);
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState('');

  //detalle de cuota
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [detalleCuota, setDetalleCuota] = useState(null);


  const cargarSocios = async () => {
    try {
      const resp = await getSocios();
      setSocios(resp?.data?.data ?? []);
    } catch (err) {
      console.error('Error al cargar socios:', err);
      setError(true);
    } finally {
      setLoadingSocios(false);
    }
  };

  const cargarAfiliaciones = async () => {
    try {
      const resp = await getAfiliaciones();
      setAfiliaciones(resp?.data?.data ?? []);
    } catch (err) {
      console.error('Error al cargar afiliaciones:', err);
      setError(true);
    } finally {
      setLoadingAfiliaciones(false);
    }
  };

  const cargarCuotas = async () => {
    try {
      const resp = await getCuotas();
      setCuotas(resp?.data?.data ?? []);
    } catch (err) {
      console.error('Error al cargar cuotas:', err);
      setError(true);
    } finally {
      setLoadingCuotas(false);
    }
  };

  useEffect(() => {
    cargarSocios();
  }, []);
  useEffect(() => {
    cargarAfiliaciones();
  }, []);
  useEffect(() => {
    cargarCuotas();
  }, []);

  const cuotasDeSocio = (idSocio) => cuotas.filter((c) => c.socio?.id === idSocio)
  const afiliacionesDeSocio = (idSocio) => afiliaciones.filter((a) => a.socio?.id === idSocio)
  const socioEstaActivo = (idSocio) => afiliacionesDeSocio(idSocio).some((a) => !a.fechaFin)


  const toggleDetails = (id) => {
    setDetails((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleFiltroImpagas = (id) => {
    setMostrarSoloImpagas((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleGenerarCuotas = async () => {
    setGenerando(true)
    setMensajeGeneracion(null)
    try {
      const resp = await generarCuotas(Number(mesGenerar), Number(anioGenerar))
      setMensajeGeneracion({ tipo: 'success', texto: resp?.data?.message ?? 'Cuotas generadas correctamente' })
      await cargarCuotas()
    } catch (err) {
      setMensajeGeneracion({ tipo: 'danger', texto: err?.response?.data?.message ?? 'Error al generar las cuotas' })
    } finally {
      setGenerando(false)
    }
  }

  const abrirModalPago = (cuota) => {
    setCuotaSeleccionada(cuota)
    setFormPago({ metodoPago: 'efectivo', fechaPago: hoy.toISOString().slice(0, 10) })
    setModalPagoVisible(true)
  }

  const confirmarPago = async () => {
    if (!cuotaSeleccionada) return
    try {
      await registrarPagoCuota(cuotaSeleccionada.id, { pagada: true, ...formPago })
      setModalPagoVisible(false)
      setCuotaSeleccionada(null)
      await cargarCuotas()
    } catch (err) {
      console.error('Error al marcar la cuota como pagada:', err)
    }
  }

  const handleDesmarcarPago = async (cuota) => {
    try {
      await registrarPagoCuota(cuota.id, { pagada: false });
      await cargarCuotas();
    } catch (err) {
      console.error('Error al deshacer el pago:', err);
    }
  };

  const abrirModalVencimiento = (cuota) => {
    setCuotaSeleccionada(cuota)
    setNuevaFechaVencimiento(cuota.fechaVencimiento ? cuota.fechaVencimiento.slice(0, 10) : '')
    setModalVencimientoVisible(true)
  }

  const guardarVencimiento = async () => {
    if (!cuotaSeleccionada) return;
    try {
      await actualizarCuota(cuotaSeleccionada.id, {
        fechaVencimiento: nuevaFechaVencimiento,
      });
      setModalVencimientoVisible(false);
      setCuotaSeleccionada(null);
      await cargarCuotas();
    } catch (err) {
      console.error('Error al actualizar el vencimiento:', err);
    }
  };

  const abrirModalDetalle = (cuota) => {
    setDetalleCuota(cuota);
    setModalDetalleVisible(true);
  };

  if (error) {
    return (
      <CCard className="rounded shadow-sm p-3 mx-auto" style={{ maxWidth: '900px' }}>
        <p className="text-danger">No se pudieron cargar los datos. Verifica la API.</p>
      </CCard>
    )
  }

  if (loading) {
    return (
      <CCard className="rounded shadow-sm p-3 mx-auto text-center" style={{ maxWidth: '900px' }}>
        <CSpinner color="primary" />
        <p className="mt-2">Cargando cuotas...</p>
      </CCard>
    )
  }

  const sociosConNombreCompleto = socios.map((s) => ({
    ...s,
    nombreCompleto: `${s.nombre} ${s.apellido}`,
    estadoAfiliacion: socioEstaActivo(s.id) ? 'Activo' : 'Inactivo',
  }))

  const sociosVisibles = mostrarInactivos ? sociosConNombreCompleto : sociosConNombreCompleto.filter((s) => s.estadoAfiliacion === 'Activo');

  const morosos = sociosConNombreCompleto.map((s) => {
      const impagasVencidas = cuotasDeSocio(s.id).filter(
        (c) => !c.pagada && new Date(c.fechaVencimiento) < hoy,
      );
      const totalAdeudado = impagasVencidas.reduce(
        (acc, c) => acc + Number(c.monto),
        0,
      );
      return { ...s, cuotasImpagas: impagasVencidas, totalAdeudado };
    }).filter((s) => s.cuotasImpagas.length > 0).sort((a, b) => b.totalAdeudado - a.totalAdeudado);


  const columns = [
    { key: 'id', label: 'ID', _style: { width: '10%' }, sorter: true },
    { key: 'nombreCompleto', label: 'Nombre completo', _style: { width: '55%' }, sorter: true },
    { key: 'estadoAfiliacion', label: 'Afiliación', _style: { width: '15%' }, filter: false },
    { key: 'acciones', label: '', _style: { width: '20%' }, filter: false, sorter: false },
  ]

  return (
    <CCard
      className="rounded shadow-sm p-3 mx-auto"
      style={{ maxWidth: '900px' }}
    >
      <h4 className="mb-3">Administración de Cuotas</h4>
      <div className="border rounded p-3 mb-4 bg-light">
        <h6 className="mb-3">Generar cuotas del mes</h6>
        <div className="d-flex gap-2 align-items-end flex-wrap">
          <div>
            <label className="form-label mb-1">Mes</label>
            <CFormSelect value={mesGenerar} onChange={(e) => setMesGenerar(e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </CFormSelect>
          </div>
          <div>
            <label className="form-label mb-1">Año</label>
            <CFormInput type="number" value={anioGenerar} onChange={(e) => setAnioGenerar(e.target.value)} style={{ width: '110px' }} />
          </div>
          <CButton color="primary" onClick={handleGenerarCuotas} disabled={generando}>
            {generando ? <CSpinner size="sm" /> : 'Generar cuotas'}
          </CButton>
        </div>
        {mensajeGeneracion && <p className={`mt-2 mb-0 text-${mensajeGeneracion.tipo}`}>{mensajeGeneracion.texto}</p>}
      </div>

      <CNav variant="tabs" className="mb-3">
        <CNavItem>
          <CNavLink active={vista === 'porSocio'} onClick={() => setVista('porSocio')} style={{ cursor: 'pointer' }}>
            Por socio
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={vista === 'morosos'} onClick={() => setVista('morosos')} style={{ cursor: 'pointer' }}>
            Socios morosos {morosos.length > 0 && <CBadge color="danger">{morosos.length}</CBadge>}
          </CNavLink>
        </CNavItem>
      </CNav>
      
      {vista === 'porSocio' ? (
          <>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="toggleInactivos" checked={mostrarInactivos} onChange={(e) => setMostrarInactivos(e.target.checked)}/>
              <label className="form-check-label" htmlFor="toggleInactivos">
                Mostrar socios inactivos
              </label>
            </div>
      <CSmartTable
        columns={columns}
        items={sociosVisibles}
        pagination={false}
        tableFilter
        sorter
        scopedColumns={{
          nombreCompleto: (item) => <td>{item.nombreCompleto}</td>,
          estadoAfiliacion: (item) => (
                <td>
                <CBadge color={item.estadoAfiliacion === 'Activo' ? 'success' : 'secondary'}>
                  {item.estadoAfiliacion}
                </CBadge>
              </td>),
          acciones: (item) => (
            <td className="py-2">
              <CButton
                size="sm"
                color="primary"
                variant="outline"
                className="float-end"
                onClick={() => toggleDetails(item.id)}
              >
                {details.includes(item.id) ? 'Ocultar' : 'Ver'}
              </CButton>
            </td>
          ),
          details: (item) => {
            const soloImpagas = mostrarSoloImpagas[item.id]
            const cuotasFiltradas = soloImpagas ? cuotasDeSocio(item.id).filter((c) => !c.pagada) : cuotasDeSocio(item.id)

            return (
              <CCollapse visible={details.includes(item.id)}>
                <div className="p-2 border-start border-primary">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      Cuotas mensuales de {item.nombreCompleto}
                    </h6>
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        onClick={() => toggleFiltroImpagas(item.id)}
                      >
                        {soloImpagas ? 'Mostrar todas' : 'Mostrar solo impagas'}
                      </CButton>
                    </div>
                    {cuotasFiltradas.length === 0 ? (
                      <p className="text-muted">No hay cuotas para mostrar.</p>
                    ) : (
                  
                  <table className="table table-sm table-bordered align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Mes/Año</th><th>Vencimiento</th><th>Monto</th>
                            <th>Estado</th><th>Método</th><th>Fecha de pago</th><th></th>
                          </tr>
                        </thead>
                      <tbody>
                        {cuotasFiltradas
                          .slice()
                          .sort((a, b) => b.anio - a.anio || b.mes - a.mes)
                          .map((cuota) => (
                            <tr key={cuota.id}>
                              <td>{cuota.mes}/{cuota.anio}</td>
                              <td>{new Date(cuota.fechaVencimiento).toLocaleDateString()}</td>
                              <td>${cuota.monto}</td>
                              <td className={cuota.pagada ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {cuota.pagada ? ' Pagada' : ' Impaga'}
                              </td>
                              <td>{cuota.metodoPago ?? '-'}</td>
                              <td>{cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString() : '-'}</td>
                              <td>
                                  <div className="d-flex gap-1 flex-wrap">
                                    <CButton size="sm" color="info" variant="outline" onClick={() => abrirModalDetalle(cuota)}>Detalle</CButton>
                                    {!cuota.pagada ? (
                                      <CButton size="sm" color="success" onClick={() => abrirModalPago(cuota)}>Marcar pagada</CButton>
                                    ) : (
                                      <CButton size="sm" color="warning" style={{ color: '#fff' }} onClick={() => handleDesmarcarPago(cuota)}>Deshacer pago</CButton>
                                    )}
                                    <CButton size="sm" color="secondary" variant="outline" onClick={() => abrirModalVencimiento(cuota)}>Vencimiento</CButton>
                                  </div>
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
        tableProps={{
          responsive: true,
          striped: true,
          hover: true,
          className: 'table-sm',
        }}
        tableBodyProps={{ className: 'align-middle' }}
      />
      </>
      ) : (
        <div>
          {morosos.length === 0 ? (
            <p className="text-muted">No hay socios con cuotas impagas vencidas. </p>
          ) : (
            <table className="table table-sm table-bordered align-middle">
              <thead className="table-light">
                <tr><th>Socio</th><th>Cuotas impagas</th><th>Total adeudado</th><th></th></tr>
              </thead>
              <tbody>
                {morosos.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nombreCompleto}</td>
                    <td>{s.cuotasImpagas.length}</td>
                    <td className="text-danger fw-bold">${s.totalAdeudado.toFixed(2)}</td>
                    <td>
                      <CButton size="sm" color="primary" variant="outline" onClick={() => { setVista('porSocio'); if (!details.includes(s.id)) toggleDetails(s.id) }}>
                        Ver detalle
                      </CButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <CModal visible={modalPagoVisible} onClose={() => setModalPagoVisible(false)}>
        <CModalHeader><CModalTitle>Marcar cuota como pagada</CModalTitle></CModalHeader>
        <CModalBody>
          <label className="form-label">Método de pago</label>
          <CFormSelect className="mb-3" value={formPago.metodoPago} onChange={(e) => setFormPago((prev) => ({ ...prev, metodoPago: e.target.value }))}>
            <option value="efectivo">Efectivo</option>
            <option value="mercado_pago">Mercado Pago</option>
          </CFormSelect>
          <label className="form-label">Fecha de pago</label>
          <CFormInput type="date" value={formPago.fechaPago} onChange={(e) => setFormPago((prev) => ({ ...prev, fechaPago: e.target.value }))} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalPagoVisible(false)}>Cancelar</CButton>
          <CButton color="success" onClick={confirmarPago}>Confirmar pago</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={modalVencimientoVisible} onClose={() => setModalVencimientoVisible(false)}>
        <CModalHeader><CModalTitle>Corregir fecha de vencimiento</CModalTitle></CModalHeader>
        <CModalBody>
          <label className="form-label">Nueva fecha de vencimiento</label>
          <CFormInput type="date" value={nuevaFechaVencimiento} onChange={(e) => setNuevaFechaVencimiento(e.target.value)} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVencimientoVisible(false)}>Cancelar</CButton>
          <CButton color="primary" onClick={guardarVencimiento}>Guardar</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={modalDetalleVisible} onClose={() => setModalDetalleVisible(false)}>
        <CModalHeader><CModalTitle>Detalle de la cuota</CModalTitle></CModalHeader>
        <CModalBody>
          {!detalleCuota?.detalles || detalleCuota.detalles.length === 0 ? (
            <p className="text-muted">Esta cuota no tiene conceptos desglosados.</p>
          ) : (
            <table className="table table-sm table-bordered">
              <thead className="table-light"><tr><th>Concepto</th><th>Monto</th></tr></thead>
              <tbody>
                {detalleCuota.detalles.map((d) => (
                  <tr key={d.id}><td>{d.concepto}</td><td>${d.monto}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><td className="fw-bold">Total</td><td className="fw-bold">${detalleCuota.monto}</td></tr></tfoot>
            </table>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDetalleVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>

    </CCard>
  )
}
