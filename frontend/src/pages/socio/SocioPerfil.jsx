import { useCallback, useEffect, useState } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import '../../components/SocioHome.css';

const PASS_VACIO = { actual: '', nueva: '', repetir: '' };

function validarFortaleza(pass) {
  if (typeof pass !== 'string') {
    return 'La contraseña debe ser una cadena de texto válida';
  }

  if (pass.trim().length < 6) {
    return 'La nueva contraseña debe tener al menos 6 caracteres';
  }

  if (pass.length > 64) {
    return 'La nueva contraseña no puede superar los 64 caracteres';
  }

  return null;
}
import { getMiPerfil, actualizarMiPerfil, cambiarPasswordSocio } from '../../api/socios';

export function SocioPerfil() {
  const [socio, setSocio] = useState(null);
  const [form, setForm] = useState({ email: '', telefono: '' });
  const [editando, setEditando] = useState({ email: false, telefono: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [passForm, setPassForm] = useState(PASS_VACIO);
  const [passError, setPassError] = useState(null);
  const [passLoading, setPassLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarPerfil = useCallback(async () => {
    try {
      const res = await getMiPerfil();
      const actual = res.data?.data;
      if (actual) {
        setSocio(actual);
        setForm({ email: actual.email, telefono: actual.telefono });
      }
    } catch (err) {
      console.error('Error al cargar perfil:', err);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const handleGuardarCampo = async (campo) => {
    try {
      await actualizarMiPerfil({ [campo]: form[campo] });
      setEditando((prev) => ({ ...prev, [campo]: false }));
      setMensaje(` ${campo} actualizado`);
    } catch (error) {
      console.error(` Error al actualizar ${campo}:`, error);
      setMensaje(` Error al actualizar ${campo}`);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setPassForm(PASS_VACIO);
    setPassError(null);
  };

  const validarYGuardarPassword = async () => {
    const { actual, nueva, repetir } = passForm;
    setPassError(null);

    if (!actual || !nueva || !repetir) {
      setPassError('Completá todos los campos');
      return;
    }
    const errorFortaleza = validarFortaleza(nueva);
    if (errorFortaleza) {
      setPassError(errorFortaleza);
      return;
    }
    if (nueva !== repetir) {
      setPassError('Las contraseñas no coinciden');
      return;
    }
    if (nueva === actual) {
      setPassError('La nueva contraseña debe ser distinta de la actual');
      return;
    }

    try {
      setPassLoading(true);
      await cambiarPasswordSocio({ actual, nueva });
      cerrarModal();
      setMensaje(' Contraseña actualizada');
    } catch (error) {
      console.error(' Error al actualizar contraseña:', error);
      setPassError(
        error.response?.data?.message ?? 'No se pudo actualizar la contraseña',
      );
    } finally {
      setPassLoading(false);
    }
  };

  if (!socio) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-card">
      <h3 className="perfil-titulo">Mi perfil</h3>

      <div className="mb-3">
        <label className="fw-bold">ID:</label>
        <div>{socio.id}</div>
      </div>

      <div className="mb-3">
        <label className="fw-bold">Apellido:</label>
        <div>{socio.apellido}</div>
      </div>

      <div className="mb-3">
        <label className="fw-bold">Nombre:</label>
        <div>{socio.nombre}</div>
      </div>

      {/* Email */}
      <div className="mb-3">
        <label className="fw-bold">Email</label>
        {editando.email ? (
          <div className="d-flex gap-2">
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <CButton
              size="sm"
              color="info"
              onClick={() => handleGuardarCampo('email')}
            >
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{socio.email}</span>
            <CButton
              size="sm"
              color="info"
              variant="outline"
              onClick={() => setEditando((prev) => ({ ...prev, email: true }))}
            >
              Modificar
            </CButton>
          </div>
        )}
      </div>

      {/* Teléfono */}
      <div className="mb-3">
        <label className="fw-bold">Teléfono</label>
        {editando.telefono ? (
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              value={form.telefono}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, telefono: e.target.value }))
              }
            />
            <CButton
              size="sm"
              color="info"
              onClick={() => handleGuardarCampo('telefono')}
            >
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{socio.telefono}</span>
            <CButton
              size="sm"
              color="info"
              variant="outline"
              onClick={() =>
                setEditando((prev) => ({ ...prev, telefono: true }))
              }
            >
              Modificar
            </CButton>
          </div>
        )}
      </div>

      {/* Contraseña */}
      <div className="mb-3">
        <label className="fw-bold">Contraseña</label>
        <div className="d-flex justify-content-between align-items-center">
          <span>••••••••</span>
          <CButton
            size="sm"
            color="info"
            variant="outline"
            onClick={() => setModalVisible(true)}
          >
            Cambiar contraseña
          </CButton>
        </div>
      </div>

      {mensaje && <p className="mt-3 text-success">{mensaje}</p>}

      {/* Modal contraseña */}
      <CModal visible={modalVisible} onClose={cerrarModal}>
        <CModalHeader>
          <CModalTitle>Cambiar contraseña</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="fw-bold">Contraseña actual</label>
            <input
              type="password"
              className="form-control"
              autoComplete="current-password"
              value={passForm.actual}
              onChange={(e) =>
                setPassForm((prev) => ({ ...prev, actual: e.target.value }))
              }
            />
          </div>

          <div className="mb-3">
            <label className="fw-bold">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={passForm.nueva}
              onChange={(e) =>
                setPassForm((prev) => ({ ...prev, nueva: e.target.value }))
              }
            />
            <small className="text-muted">
              Mínimo 6 caracteres.
            </small>
          </div>

          <div className="mb-3">
            <label className="fw-bold">Repetir nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={passForm.repetir}
              onChange={(e) =>
                setPassForm((prev) => ({ ...prev, repetir: e.target.value }))
              }
            />
          </div>

          {passError && <p className="text-danger mb-0">{passError}</p>}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={cerrarModal}
            disabled={passLoading}
          >
            Cancelar
          </CButton>
          <CButton
            color="info"
            onClick={validarYGuardarPassword}
            disabled={passLoading}
          >
            {passLoading ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
