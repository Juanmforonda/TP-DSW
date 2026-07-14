// src/pages/ListarAmarras.jsx
import { useEffect, useState } from 'react';
import { getAmarras } from '../api/amarras.js';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CRow,
  CCol
} from '@coreui/react';

export default function ListarAmarras() {
  const [amarras, setAmarras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    zona: '',
    estado: ''
  });

  useEffect(() => {
    cargarAmarras();
  }, []);

  const cargarAmarras = async () => {
    try {
      const res = await getAmarras();
      setAmarras(res.data.data);
    } catch (error) {
      console.error('Error al cargar amarras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const amarrasFiltradas = amarras.filter(amarra => {
    return (!filtros.zona || amarra.zona.toLowerCase() === filtros.zona.toLowerCase()) &&
           (!filtros.estado || amarra.estado === filtros.estado);
  });

  return (
    <div className="p-4">
      <CCard>
        <CCardHeader>
          <h4>Listado de Amarras</h4>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormSelect
                name="zona"
                value={filtros.zona}
                onChange={handleFiltroChange}
                label="Filtrar por Zona"
              >
                <option value="">Todas las zonas</option>
                <option value="norte">Norte</option>
                <option value="sur">Sur</option>
                <option value="este">Este</option>
                <option value="oeste">Oeste</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormSelect
                name="estado"
                value={filtros.estado}
                onChange={handleFiltroChange}
                label="Filtrar por Estado"
              >
                <option value="">Todos los estados</option>
                <option value="libre">Libre</option>
                <option value="ocupado">Ocupado</option>
              </CFormSelect>
            </CCol>
          </CRow>

          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando amarras...</p>
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Precio Mensual</CTableHeaderCell>
                  <CTableHeaderCell>Longitud Maxima</CTableHeaderCell>
                  <CTableHeaderCell>Zona</CTableHeaderCell>
                  <CTableHeaderCell>Nro Pilon</CTableHeaderCell>
                  <CTableHeaderCell>Embarcación</CTableHeaderCell>
                  <CTableHeaderCell>Socio</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {amarrasFiltradas.map((amarra) => {
                  const embarcacion = amarra.embarcacion;
                  const socio = embarcacion?.socio;
                  const socioTexto = !embarcacion ? '-' : socio ? `${socio.id} - ${socio.nombre} ${socio.apellido}` : 'Club Náutico';
                  return (
                    <CTableRow key={amarra.id}>
                      <CTableDataCell>{amarra.id}</CTableDataCell>
                      <CTableDataCell>{amarra.estado}</CTableDataCell>
                      <CTableDataCell>${amarra.precioMensualBase}</CTableDataCell>
                      <CTableDataCell>{amarra.longitudMax}</CTableDataCell>
                      <CTableDataCell>{amarra.zona}</CTableDataCell>
                      <CTableDataCell>{amarra.nroPilon}</CTableDataCell>
                      <CTableDataCell>
                        {embarcacion ? `${embarcacion.id} - ${embarcacion.nombre}` : '-'}
                      </CTableDataCell>
                      <CTableDataCell>{socioTexto}</CTableDataCell>
                    </CTableRow>
                  );
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
}