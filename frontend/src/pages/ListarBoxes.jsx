/*import { useEffect, useState } from 'react';
import { getBoxes, actualizarBox, eliminarBox } from '../api/boxes.js';
import { EntityTable } from '../components/TablaGenerica.jsx';
import { CCard, CCardBody, CCardHeader, CRow, CCol } from '@coreui/react';*/
/*
export default function ListarBoxes() {
  const [boxes, setBoxes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [boxesFiltrados, setBoxesFiltrados] = useState([]);

  useEffect(() => {
    cargarBoxes();
  }, []);

  useEffect(() => {
    if (boxes) {
      const conEmbarcacion = boxes.map((box) => {
        const embarcacion = box.embarcacion;
        const socio = embarcacion?.socio;
        return {
          ...box,
          embarcacionTexto: embarcacion ? `${embarcacion.id} - ${embarcacion.nombre}` : '-',
          socioTexto: !embarcacion ? '-' : socio ? `${socio.id} - ${socio.nombre} ${socio.apellido}` : 'Club Náutico'
        };
      });

      if (filtroEstado === 'todos') {
        setBoxesFiltrados(conEmbarcacion);
      } else {
        setBoxesFiltrados(conEmbarcacion.filter(box => box.estado === filtroEstado));
      }
    }
  }, [boxes, filtroEstado]);

  const cargarBoxes = async () => {
    try {
      const res = await getBoxes();
      setBoxes(res.data.data || []);
    } catch (error) {
      console.error('Error al cargar boxes:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Listado de Boxes</h2>
      
      <CCard className="mb-4">
        <CCardHeader>
          <h5>Filtros</h5>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol>
              <div className="mb-3">
                <label className="form-label">Filtrar por Estado</label>
                <select
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {boxesFiltrados == null ? (
        <div className="text-center p-4 border rounded">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando boxes...</p>
        </div>
      ) : !Array.isArray(boxesFiltrados) ? (
        <div className="alert alert-warning">
          <strong>Error:</strong> Los datos no son un array válido.
          <br />
          <small>Tipo recibido: {typeof boxesFiltrados}</small>
        </div>
      ) : boxesFiltrados.length === 0 ? (
        <div className="text-center p-4 border rounded">
          <h5>No hay boxes registrados</h5>
          <p className="text-muted">
            No se encontraron boxes en el sistema.
          </p>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {filtroEstado !== 'todos' && (
                <span className="text-muted">
                  Mostrando boxes en estado: <strong>{filtroEstado}</strong>
                </span>
              )}
            </div>
            <div>
              <span className="text-muted">
                Total: <strong>{boxesFiltrados.length}</strong> boxes
              </span>
            </div>
          </div>
          
          <EntityTable
            entityName="box"
            entityNamePlural="boxes"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nroBox', label: 'Número de Box' },
              { key: 'estado', label: 'Estado' },
              { key: 'precioMensualBase', label: 'Precio Mensual' },
              { key: 'embarcacionTexto', label: 'Embarcacion' },
              { key: 'socioTexto', label: 'Socio' }
            ]}
            data={boxesFiltrados}
            className="tabla-boxes"
          />
        </>
      )}
    </div>
  );
}
  */

import { useEffect, useState } from 'react';
import { getBoxes, actualizarBox, eliminarBox } from '../api/boxes.js';
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

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'estado', label: 'Estado' },
  { key: 'nroBox', label: 'Nro Box' },
  { key: 'precioMensualBase', label: 'Precio Mensual' },
  { key: 'embarcacion', label: 'Embarcación' },
  { key: 'socio', label: 'Socio' },
];

export default function ListarBoxes() {
  const [boxes, setBoxes] = useState([]);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [reservasSeleccionadas, setReservasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarBoxes();
  }, []);

  const cargarBoxes = async () => {
    try {
      const res = await getBoxes();
      setBoxes(res.data.data.map(mapBoxToRow));
    } catch (error) {
      console.error('Error al cargar boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, datosActualizados) => {
    try {
      await actualizarBox(id, datosActualizados);
      cargarBoxes();
    } catch (error) {
      console.error('Error al actualizar box:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await eliminarBox(id);
      cargarBoxes();
    } catch (error) {
      console.error('Error al eliminar box:', error);
    }
  };

  const verHistorial = (item) => {
    setReservasSeleccionadas(item.reservasInfraestructura);
    setHistorialOpen(true);
  };

  const boxesFiltrados = boxes.filter((b) => {
    return filtroEstado === '' || b.estado === filtroEstado;
  });

  if (loading) return <p>Cargando boxes...</p>;
  return (
    <>
    
      <CRow className="mb-3">
        <CCol xs={4}>
          <CFormSelect
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="ocupado">Ocupado</option>
            <option value="mantenimiento">Mantenimiento</option>
          </CFormSelect>
        </CCol>
      </CRow>
      <EntityTable
        columns={columns}
        data={boxesFiltrados}
        entityName="box"
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
            <p>Este box no tiene reservas registradas.</p>
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

function mapBoxToRow(box) {
  const reservaActiva = box.reservasInfraestructura?.find(
    (r) => r.estado === 'ACTIVA',
  );
  return {
    id: box.id,
    estado: box.estado,
    nroBox: box.nroBox,
    precioMensualBase: box.precioMensualBase,
    embarcacion: reservaActiva?.embarcacion?.nombre ?? '—',
    socio: reservaActiva?.socio
      ? `${reservaActiva.socio.nombre} ${reservaActiva.socio.apellido}`
      : '—',
    reservasInfraestructura: box.reservasInfraestructura ?? [],
  };
}
