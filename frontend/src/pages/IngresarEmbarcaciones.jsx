import { useEffect, useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
} from '@coreui/react';
import { crearEmbarcacion } from '../api/embarcaciones.js';
import { getAmarras } from '../api/amarras.js';
import { getBoxes } from '../api/boxes.js';
import { getSocios } from '../api/socios.js';
import { getTiposEmbarcacion } from '../api/tiposEmbarcacion.js';

const formularioInicial = {
  nombre: '',
  matricula: '',
  eslora: '',
  tipoEmbarcacion: '',
  socio: '',
  ubicacionTipo: 'amarra',
  ubicacionId: '',
};

export default function IngresarEmbarcaciones() {
  const [tiposEmbarcacion, setTiposEmbarcacion] = useState([]);
  const [socios, setSocios] = useState([]);
  const [amarrasLibres, setAmarrasLibres] = useState([]);
  const [boxesLibres, setBoxesLibres] = useState([]);
  const [formularioClub, setFormularioClub] = useState(formularioInicial);
  const [formularioSocio, setFormularioSocio] = useState(formularioInicial);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarOpciones = async () => {
    try {
      const [tipos, sociosResponse, amarras, boxes] = await Promise.all([
        getTiposEmbarcacion(),
        getSocios(),
        getAmarras(),
        getBoxes(),
      ]);
      setTiposEmbarcacion(tipos.data?.data ?? tipos.data ?? []);
      setSocios(sociosResponse.data?.data ?? sociosResponse.data ?? []);
      setAmarrasLibres(
        (amarras.data?.data ?? []).filter((item) => item.estado === 'libre'),
      );
      setBoxesLibres(
        (boxes.data?.data ?? []).filter((item) => item.estado === 'disponible'),
      );
    } catch (requestError) {
      console.error('Error al cargar opciones para ingresar embarcaciones:', requestError);
      setError('No se pudieron cargar los tipos, socios o ubicaciones disponibles.');
    }
  };

  useEffect(() => {
    cargarOpciones();
  }, []);

  const actualizarCampo = (setFormulario, campo, valor) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
      ...(campo === 'ubicacionTipo' ? { ubicacionId: '' } : {}),
    }));
    setError('');
    setMensaje('');
  };

  const guardar = async (esClub, formulario, setFormulario) => {
    const camposObligatorios = [
      formulario.nombre,
      formulario.matricula,
      formulario.eslora,
      formulario.tipoEmbarcacion,
      formulario.ubicacionId,
    ];
    if (!esClub) camposObligatorios.push(formulario.socio);

    if (camposObligatorios.some((campo) => !campo)) {
      setError('Completá todos los campos y seleccioná una ubicación.');
      return;
    }

    const payload = {
      nombre: formulario.nombre,
      matricula: formulario.matricula,
      eslora: Number(formulario.eslora),
      tipoEmbarcacion: Number(formulario.tipoEmbarcacion),
      ...(esClub ? {} : { socio: Number(formulario.socio) }),
      ...(formulario.ubicacionTipo === 'amarra'
        ? { amarra: Number(formulario.ubicacionId) }
        : { box: Number(formulario.ubicacionId) }),
    };

    setGuardando(true);
    setError('');
    setMensaje('');
    try {
      await crearEmbarcacion(payload);
      setFormulario(formularioInicial);
      setMensaje(
        esClub
          ? 'La embarcación del club fue ingresada correctamente.'
          : 'La embarcación del socio fue ingresada correctamente.',
      );
      await cargarOpciones();
    } catch (requestError) {
      console.error('Error al ingresar embarcación:', requestError);
      setError(
        requestError?.response?.data?.errors?.join('\n') ??
          requestError?.response?.data?.message ??
          'No se pudo ingresar la embarcación.',
      );
    } finally {
      setGuardando(false);
    }
  };

  const camposComunes = (formulario, setFormulario, prefijo) => (
    <>
      <CFormInput
        label="Nombre"
        className="mb-3"
        value={formulario.nombre}
        onChange={(event) => actualizarCampo(setFormulario, 'nombre', event.target.value)}
      />
      <CFormInput
        label="Matrícula"
        className="mb-3"
        value={formulario.matricula}
        onChange={(event) => actualizarCampo(setFormulario, 'matricula', event.target.value)}
      />
      <CFormInput
        label="Eslora (metros)"
        type="number"
        className="mb-3"
        value={formulario.eslora}
        onChange={(event) => actualizarCampo(setFormulario, 'eslora', event.target.value)}
      />
      <CFormSelect
        label="Tipo de embarcación"
        className="mb-3"
        value={formulario.tipoEmbarcacion}
        onChange={(event) => actualizarCampo(setFormulario, 'tipoEmbarcacion', event.target.value)}
      >
        <option value="">Seleccionar tipo...</option>
        {tiposEmbarcacion.map((tipo) => (
          <option key={`${prefijo}-tipo-${tipo.id}`} value={tipo.id}>
            {tipo.nombre}
          </option>
        ))}
      </CFormSelect>
    </>
  );

  const campoUbicacion = (formulario, setFormulario, prefijo) => (
    <>
      <CFormSelect
        label="Ubicación"
        className="mb-3"
        value={formulario.ubicacionTipo}
        onChange={(event) => actualizarCampo(setFormulario, 'ubicacionTipo', event.target.value)}
      >
        <option value="amarra">Amarra</option>
        <option value="box">Box</option>
      </CFormSelect>
      <CFormSelect
        label={formulario.ubicacionTipo === 'amarra' ? 'Amarra disponible' : 'Box disponible'}
        value={formulario.ubicacionId}
        onChange={(event) => actualizarCampo(setFormulario, 'ubicacionId', event.target.value)}
      >
        <option value="">Seleccionar...</option>
        {(formulario.ubicacionTipo === 'amarra' ? amarrasLibres : boxesLibres).map((item) => (
          <option key={`${prefijo}-ubicacion-${item.id}`} value={item.id}>
            {formulario.ubicacionTipo === 'amarra'
              ? `Amarra ${item.id} - ${item.zona}`
              : `Box ${item.nroBox ?? item.id}`}
          </option>
        ))}
      </CFormSelect>
    </>
  );

  return (
    <div className="p-4">
      <h2 className="mb-4">Ingresar embarcaciones</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      <CRow className="g-4">
        <CCol lg={6}>
          <CCard>
            <CCardHeader>Embarcación del club</CCardHeader>
            <CCardBody>
              {camposComunes(formularioClub, setFormularioClub, 'club')}
              {campoUbicacion(formularioClub, setFormularioClub, 'club')}
              <CButton color="primary" disabled={guardando} onClick={() => guardar(true, formularioClub, setFormularioClub)}>
                Ingresar embarcación del club
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard>
            <CCardHeader>Embarcación de un socio</CCardHeader>
            <CCardBody>
              <CFormSelect
                label="Socio"
                className="mb-3"
                value={formularioSocio.socio}
                onChange={(event) => actualizarCampo(setFormularioSocio, 'socio', event.target.value)}
              >
                <option value="">Seleccionar socio...</option>
                {socios.map((socio) => (
                  <option key={socio.id} value={socio.id}>
                    {socio.nombre} {socio.apellido}
                  </option>
                ))}
              </CFormSelect>
              {camposComunes(formularioSocio, setFormularioSocio, 'socio')}
              {campoUbicacion(formularioSocio, setFormularioSocio, 'socio')}
              <CButton color="success" disabled={guardando} onClick={() => guardar(false, formularioSocio, setFormularioSocio)}>
                Ingresar embarcación del socio
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
}
