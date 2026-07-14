import { useEffect, useState } from 'react';
import { getBoxes, crearBox, eliminarBox, actualizarBox } from '../api/boxes.js';
import { EntityTable } from '../components/TablaGenerica.jsx';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CButton,
} from '@coreui/react';

export default function AdministrarBoxes(){
  const [boxes, setBoxes] = useState([]);
  const [precioMensualBase, setPrecioMensualBase] = useState('');
  const [nroBox, setNroBox] = useState('');

  useEffect(() => {
    cargarBoxes();
  }, []);

  const cargarBoxes = async () => {
    try {
      const res = await getBoxes();
      setBoxes(res.data.data || []);
    } catch (error) {
      console.error('Error al cargar boxes:', error);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      // Todo box nuevo arranca disponible; se ocupa recién cuando se le asigna una embarcación.
      await crearBox({ estado: 'disponible', precioMensualBase, nroBox });
      await cargarBoxes();
      setPrecioMensualBase('');
      setNroBox('');
    } catch (error) {
      console.error('Error al crear box:', error);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarBox(id);
      console.log('Eliminar box con ID:', id);
      cargarBoxes();
    } catch (error) {
      console.error('Error al eliminar box:', error);
    }
  };

  const handleEditar = async (id, datosActualizados) => {
    try {
      // Convertir campos numéricos
      const datosProcesados = {
        ...datosActualizados,
        nroBox: String(datosActualizados.nroBox),
        precioMensualBase: Number(datosActualizados.precioMensualBase)
      };
      await actualizarBox(id, datosProcesados);
      console.log('Editar box ID:', id, 'con datos:', datosProcesados);
      cargarBoxes();
    } catch (error) {
      console.error('Error al editar box:', error);
    }
  };

  return (
    <div className="p-4">
      <CCard>
        <CCardHeader>
          <h4>Crear Box</h4>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleCrear}>
            <CRow className="mb-3">
              <CCol md={6}>
                <div className="mb-3">
                  <label className="form-label">Número de Box</label>
                  <CFormInput
                    placeholder="Ingrese el número de box"
                    value={nroBox}
                    onChange={(e) => setNroBox(e.target.value)}
                    required
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <label className="form-label">Precio Mensual</label>
                  <CFormInput
                    placeholder="Ingrese el precio mensual"
                    value={precioMensualBase}
                    onChange={(e) => setPrecioMensualBase(Number(e.target.value))}
                    required
                    type="number"
                  />
                </div>
              </CCol>
            </CRow>
            <CButton color="primary" type="submit">
              Crear Box
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
      <div className="mt-4">
        {boxes == null ? (
          <div className="text-center p-4 border rounded">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando boxes...</p>
          </div>
        ) : !Array.isArray(boxes) ? (
          <div className="alert alert-warning">
            <strong>Error:</strong> Los datos no son un array válido.
            <br />
            <small>Tipo recibido: {typeof boxes}</small>
          </div>
        ) : boxes.length === 0 ? (
          <div className="text-center p-4 border rounded">
            <h5>No hay boxes registrados</h5>
            <p className="text-muted">
              Crea el primer box usando el formulario de arriba.
            </p>
          </div>
        ) : (
          <EntityTable
            entityName="box"
            entityNamePlural="boxes"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nroBox', label: 'Número de Box' },
              { key: 'estado', label: 'Estado' },
              { key: 'precioMensualBase', label: 'Precio Mensual' }
            ]}
            data={boxes}
            onDelete={handleEliminar}
            onEdit={handleEditar}
            className="tabla-boxes"
          />
        )}
      </div>
    </div>
  );
}