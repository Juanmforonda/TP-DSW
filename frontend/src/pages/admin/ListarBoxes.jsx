import { useEffect, useState } from 'react';
import { getBoxes, actualizarBox, eliminarBox } from '../../api/boxes.js';
import {
  CButton,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react';
import { EntityTable } from '../../components/TablaGenerica.jsx';
import HistorialReservasModal from '../../components/HistorialReservasModal.jsx';


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
      const datosBox = {
        estado: datosActualizados.estado,
        nroBox: datosActualizados.nroBox,
        precioMensualBase: datosActualizados.precioMensualBase,
      };

      await actualizarBox(id, datosBox);
      await cargarBoxes();
    } catch (error) {
      console.error(
        'Error al actualizar box:',
        error.response?.data ?? error.message
      );
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

      <HistorialReservasModal
        visible={historialOpen}
        onClose={() => setHistorialOpen(false)}
        reservas={reservasSeleccionadas}
        tipo="box"/>
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
