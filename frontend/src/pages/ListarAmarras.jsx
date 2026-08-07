// src/pages/ListarAmarras.jsx
import { useEffect, useState } from 'react';
import {
  getAmarras,
  actualizarAmarra,
  eliminarAmarra,
} from '../api/amarras.js';
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
  CFormSelect
} from '@coreui/react';
import { EntityTable } from '../components/TablaGenerica.jsx';
/*
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
                <option value="mantenimiento">Mantenimiento</option>
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
}*/

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'estado', label: 'Estado' },
  { key: 'precioMensualBase', label: 'Precio Mensual' },
  { key: 'longitudMax', label: 'Longitud Máxima' },
  { key: 'zona', label: 'Zona' },
  { key: 'nroPilon', label: 'Nro Pilón' },
  { key: 'embarcacion', label: 'Embarcación', readonly: true },
  { key: 'socio', label: 'Socio', readonly: true },
];

export default function ListaAmarras() {
  const [amarras, setAmarras] = useState([]);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [reservasSeleccionadas, setReservasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarAmarras();
  }, []);

  const cargarAmarras = async () => {
    try {
      const res = await getAmarras();
      setAmarras(res.data.data.map(mapAmarraToRow));
    } catch (error) {
      console.error('Error al cargar amarras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, datosActualizados) => {
    try {
      await actualizarAmarra(id, datosActualizados);
      cargarAmarras();
    } catch (error) {
      console.error('Error al actualizar amarra:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eliminarAmarra(id);
      cargarAmarras();
    } catch (error) {
      console.error('Error al eliminar amarra:', error);
    }
  };

  const verHistorial = (item) => {
    setReservasSeleccionadas(item.reservasInfraestructura);
    setHistorialOpen(true);
  };

  const amarrasFiltradas = amarras.filter((a) => {
    const matchZona = filtroZona === '' || a.zona === filtroZona;
    const matchEstado = filtroEstado === '' || a.estado === filtroEstado;
    return matchZona && matchEstado;
  });

  if (loading) return <p>Cargando amarras...</p>;
  console.log("holasd");

  return (
    <>
      <CRow className="mb-3">
        <CCol xs={4}>
          <CFormSelect
            value={filtroZona}
            onChange={(e) => setFiltroZona(e.target.value)}
          >
            <option value="">Todas las zonas</option>
            <option value="Norte">Norte</option>
            <option value="Sur">Sur</option>
            <option value="Este">Este</option>
            <option value="Oeste">Oeste</option>
          </CFormSelect>
        </CCol>
        <CCol xs={4}>
          <CFormSelect
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="libre">Libre</option>
            <option value="ocupado">Ocupado</option>
            <option value="mantenimiento">Mantenimiento</option>
          </CFormSelect>
        </CCol>
      </CRow>
      <EntityTable
        columns={columns}
        data={amarrasFiltradas}
        entityName="amarra"
        onEdit={handleEdit}
        onDelete={handleDelete}
        extraActions={(item) => (
          <CButton color="info" size="sm" onClick={() => verHistorial(item)}>
            Ver reservas
          </CButton>
        )}
      />

      <CModal
        visible={historialOpen}
        onClose={() => setHistorialOpen(false)}
        size="lg"
      >
        <CModalHeader>Historial de reservas</CModalHeader>
        <CModalBody>
          {reservasSeleccionadas.length === 0 ? (
            <p>Esta amarra no tiene reservas registradas.</p>
          ) : (
            <CTable striped bordered small>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Embarcación</CTableHeaderCell>
                  <CTableHeaderCell>Socio</CTableHeaderCell>
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
                      {r.embarcacion?.nombre ?? '—'}
                    </CTableDataCell>
                    <CTableDataCell>
                      {r.socio ? `${r.socio.nombre} ${r.socio.apellido}` : '—'}
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
    </>
  );
}

function mapAmarraToRow(amarra) {
  const reservaActiva = amarra.reservasInfraestructura?.find(
    (r) => r.estado === 'ACTIVA',
  );
  return {
    id: amarra.id,
    estado: amarra.estado,
    precioMensualBase: amarra.precioMensualBase,
    longitudMax: amarra.longitudMax,
    zona: amarra.zona,
    nroPilon: amarra.nroPilon,
    embarcacion: reservaActiva?.embarcacion?.nombre ?? '—',
    socio: reservaActiva?.socio
      ? `${reservaActiva.socio.nombre} ${reservaActiva.socio.apellido}`
      : '—',
    reservasInfraestructura: amarra.reservasInfraestructura ?? [],
  };
}
