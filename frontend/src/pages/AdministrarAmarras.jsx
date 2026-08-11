import { useEffect, useState } from 'react';
import { getAmarras } from '../api/amarras.js';
import { crearAmarra, eliminarAmarra, actualizarAmarra } from '../api/amarras.js';
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

export default function AdministrarAmarras(){

  const [amarras, setAmarras] = useState([]);
  const [precioMensualBase, setPrecioMensualBase] = useState('');
  const [longitudMax, setLongitudMax] = useState('');
  const [zona, setZona] = useState('');
  const [nroPilon, setNroPilon] = useState('');

  useEffect(() => {
    cargarAmarras();
  }, []);


  const cargarAmarras = async () => {
    const res = await getAmarras();
    setAmarras(res.data.data);
  };

  const handleCrear = async (e) => {
      e.preventDefault();
      // Toda amarra nueva arranca libre; se ocupa recién cuando se le asigna una embarcación.
      await crearAmarra({ estado: 'libre', precioMensualBase, longitudMax, zona, nroPilon });
      await cargarAmarras();
      setPrecioMensualBase('');
      setLongitudMax('');
      setZona('');
      setNroPilon('');
    };

    const handleEliminar = async (id) => {
      try {
        // Aquí deberías llamar a tu API para eliminar
        await eliminarAmarra(id);
        console.log('Eliminar amarra con ID:', id);
        cargarAmarras(); // Recargar después de eliminar
      } catch (error) {
        console.error('Error al eliminar amarra:', error);
      }
    };
    const handleEditar = async (id, datosActualizados) => {
      try {
        // Aquí deberías llamar a tu API para editar
        await actualizarAmarra(id, datosActualizados);
        console.log('Editar amarra ID:', id, 'con datos:', datosActualizados);
        cargarAmarras(); // Recargar después de editar
      } catch (error) {
        console.error('Error al editar amarra:', error);
      }
    };

  return (
    <div className="p-4">
      <CCard>
        <CCardHeader>
          <h4>Crear Amarras</h4>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleCrear}>
            <CRow className="mb-3">
              <CCol md={3}>
                <div className="mb-3">
                  <label className="form-label">Precio Mensual</label>
                  <CFormInput
                    type="number"
                    placeholder="Precio Mensual"
                    value={precioMensualBase}
                    onChange={(e) => setPrecioMensualBase(Number(e.target.value))}
                    required
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <label className="form-label">Longitud Maxima</label>
                  <CFormInput
                    type="number"
                    placeholder="Longitud máxima en metros"
                    value={longitudMax}
                    onChange={(e) => setLongitudMax(Number(e.target.value))}
                    required
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <label className="form-label">Zona</label>
                  <select
                    className="form-select"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una zona</option>
                    <option value="Norte">Norte</option>
                    <option value="Sur">Sur</option>
                    <option value="Este">Este</option>
                    <option value="Oeste">Oeste</option>
                  </select>
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <label className="form-label">Nro Pilon</label>
                  <CFormInput
                    type="number"
                    placeholder="Número de pilón"
                    value={nroPilon}
                    onChange={(e) => setNroPilon(Number(e.target.value))}
                    required
                  />
                </div>
              </CCol>
            </CRow>
            <CButton color="primary" type="submit">
              Crear Amarra
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
      <div className="mt-4">
        {amarras == null ? (
          <div className="text-center p-4 border rounded">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando amarras...</p>
          </div>
        ) : !Array.isArray(amarras) ? (
          <div className="alert alert-warning">
            <strong>Error:</strong> Los datos no son un array válido.
            <br />
            <small>Tipo recibido: {typeof amarras}</small>
          </div>
        ) : amarras.length === 0 ? (
          <div className="text-center p-4 border rounded">
            <h5> No hay amarras registradas</h5>
            <p className="text-muted">
              Crea la primera amarra usando el formulario de arriba.
            </p>
          </div>
        ) : (
          <>
            {console.log('datos acuales', amarras)}
            <EntityTable
              entityName="amarra"
              entityNamePlural="amarras"
              columns={[
                { key: 'id', label: 'ID' },
                { key: 'estado', label: 'Estado' },
                { key: 'precioMensualBase', label: 'Precio Mensual' },
                { key: 'longitudMax', label: 'Longitud Maxima' },
                { key: 'zona', label: 'Zona' },
                { key: 'nroPilon', label: 'Nro Pilon' },
              ]}
              data={amarras}
              onDelete={handleEliminar}
              onEdit={handleEditar}
              className="tabla-amarras"
            />
            
          </>
        )}
        
      </div>
    </div>
  );



}