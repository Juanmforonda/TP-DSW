import { useEffect, useState } from 'react';
import { getSocios, crearSocio, actualizarSocio, bajaLogicaSocio } from '../../api/socios.js';
import { TablaSocios } from '../../components/TablaSocios.jsx';
import { EntityTable } from '../../components/TablaGenerica.jsx';
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
import { crearAfiliacion } from '../../api/afiliaciones.js';

export default function AdministrarSocios() {
  const [sociosActivos, setSociosActivos] = useState([]);
  const [sociosInactivos, setSociosInactivos] = useState([]);
  const [nombre, setNombre] = useState('');
  const[apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const [tipoAfiliacion, setTipoAfiliacion] = useState('');

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () =>{
    const res = await getSocios();
    const sociosData = res.data.data;

    const activos = sociosData.filter((s) => Array.isArray(s.afiliaciones) && s.afiliaciones.some(a => a && a.fechaFin === null));
    const inactivos = sociosData.filter((s) => !Array.isArray(s.afiliaciones) || !s.afiliaciones.some(a => a && a.fechaFin === null));
    setSociosActivos(activos);
    setSociosInactivos(inactivos);

    console.log('Socios cargados:', sociosData);
    console.log('Socios activos:', activos);
  };

const handleCrear = async (e) => {
  try {
  e.preventDefault();

  if (!tipoAfiliacion.trim()) {
    alert('Debés seleccionar un tipo de afiliación válido.');
    return;
  }

  const socioResp = await crearSocio({ nombre, apellido, dni, telefono, email });
  const socioId = socioResp.data.data.id;

  await crearAfiliacion({
    fechaInicio: new Date(),
    fechaFin: null,
    tipo: tipoAfiliacion,
    socio: socioId,
  });

  await cargarSocios();
  setNombre('');
  setApellido('');
  setDni('');
  setTelefono('');
  setEmail('');
  setTipoAfiliacion('');
}
catch (error) {
  console.log('Error al crear socio y afiliación', error.response?.data);
}
};


  
  const handleEditar = async (id, socioEditar) => {
    try {
      await actualizarSocio(id, socioEditar);
      cargarSocios();
    } catch (error) {
      alert('Error al actualizar socio', error);
    }
  };

  const handleBajaLogica = async (id) => {
    try {
      await bajaLogicaSocio(id);
      cargarSocios();
    } catch (error) {
      alert('Error al dar de baja lógica al socio', error);
    }
  };

  return (
    <div className="p-4">
      <CCard>
        <CCardHeader>
          <h4>Crear Socios</h4>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleCrear}>
            <CRow className="mb-3">
              <CCol md={3}>
                <CFormInput
                  label="Nombre"
                  placeholder="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  label="Apellido"
                  placeholder="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  label="DNI"
                  placeholder="Ingrese DNI sin puntos o espacios"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  label="Teléfono"
                  placeholder="Ingrese teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  label="Email"
                  type="email"
                  placeholder="Ingrese un email válido"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <label className="form-label">Tipo de Afiliación</label>
                <select
                  className="form-select"
                  value={tipoAfiliacion}
                  onChange={(e) => setTipoAfiliacion(e.target.value)}
                  required
                >
                  <option value="" disabled>Seleccione un tipo</option>
                  <option value="Básica">Básica</option>
                </select>
              </CCol>
            </CRow>
            <CButton color="primary" type="submit">
              Crear Socio
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

      <div className="mt-4">
        <CCard className="mb-4">
        <CCardHeader>
          <h4>Socios Activos</h4>
        </CCardHeader>
        <CCardBody>
        <EntityTable
          entityName="socio"
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'apellido', label: 'Apellido' },
            { key: 'dni', label: 'DNI' },
            { key: 'email', label: 'E-Mail' },
            { key: 'telefono', label: 'Teléfono' },
          ]}
          data={sociosActivos}
          onDelete={handleBajaLogica}
          onEdit={handleEditar}
        />
        </CCardBody>
      </CCard>
      </div>
      <CCard className="mt-4">
        <CCardHeader>
          <h4>Socios Inactivos</h4>
        </CCardHeader>
        <CCardBody>
          <EntityTable
            entityName="socio"
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'nombre', label: 'Nombre' },
              { key: 'apellido', label: 'Apellido' },
              { key: 'dni', label: 'DNI' },
              { key: 'email', label: 'E-Mail' },
              { key: 'telefono', label: 'Teléfono' },
            ]}
            data={sociosInactivos}
            onDelete={handleBajaLogica}
            onEdit={handleEditar}
          />
        </CCardBody>
      </CCard>
    </div>
  );
}
