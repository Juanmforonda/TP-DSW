// src/pages/ListarAmarras.jsx
import { useEffect, useState } from 'react';
import {
  getAmarras,
  actualizarAmarra,
  eliminarAmarra,
} from '../../api/amarras.js';
import {
  CButton,
  CRow, 
  CCol,
  CFormSelect
} from '@coreui/react';
import { EntityTable } from '../../components/TablaGenerica.jsx';
import HistorialReservasModal from '../../components/HistorialReservasModal.jsx';


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

      <HistorialReservasModal
        visible={historialOpen}
        onClose={() => setHistorialOpen(false)}
        reservas={reservasSeleccionadas}
        tipo="amarra"/>
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
