// src/pages/ListarAmarras.jsx
import { useEffect, useState } from 'react';
import {
  getAmarras,
  actualizarAmarra,
  eliminarAmarra,
} from '../../api/amarras.js';
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
import { EntityTable } from '../../components/TablaGenerica.jsx';


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
