import { useEffect, useState } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { getSocios, actualizarSocio } from '../../api/socios';
import '../../components/SocioHome.css';

export function SocioPerfil({ idSocio }) {
  const [socio, setSocio] = useState(null);
  const [form, setForm] = useState({ email: '', telefono: '' });
  const [editando, setEditando] = useState({ email: false, telefono: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', repetir: '' });
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    getSocios()
      .then((res) => {
        const todos = res.data?.data ?? [];
        const actual = todos.find((s) => s.id === idSocio);
        if (actual) {
          setSocio(actual);
          setForm({ email: actual.email, telefono: actual.telefono });
        }
      })
      .catch((err) => console.error('❌ Error al cargar perfil:', err));
  }, [idSocio]);

  const handleGuardarCampo = async (campo) => {
    try {
      await actualizarSocio(idSocio, { [campo]: form[campo] });
      setEditando((prev) => ({ ...prev, [campo]: false }));
      setMensaje(`✅ ${campo} actualizado`);
    } catch (error) {
      console.error(`❌ Error al actualizar ${campo}:`, error);
      setMensaje(`❌ Error al actualizar ${campo}`);
    }
  };

  const validarYGuardarPassword = async () => {
    const { actual, nueva, repetir } = passForm;
    if (!actual || !nueva || !repetir) {
      alert('Completá todos los campos');
      return;
    }
    if (nueva.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nueva !== repetir) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      await actualizarSocio(idSocio, { password: nueva });
      alert('Contraseña actualizada');
      setModalVisible(false);
      setPassForm({ actual: '', nueva: '', repetir: '' });
    } catch (error) {
      console.error('❌ Error al actualizar contraseña:', error);
      alert('Error al actualizar contraseña');
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
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <CButton size="sm" color="info" onClick={() => handleGuardarCampo('email')}>
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{socio.email}</span>
            <CButton size="sm" color="info" variant="outline" onClick={() => setEditando((prev) => ({ ...prev, email: true }))}>
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
              onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
            />
            <CButton size="sm" color="info" onClick={() => handleGuardarCampo('telefono')}>
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{socio.telefono}</span>
            <CButton size="sm" color="info" variant="outline" onClick={() => setEditando((prev) => ({ ...prev, telefono: true }))}>
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
          <CButton size="sm" color="info" variant="outline" onClick={() => setModalVisible(true)}>
            Cambiar contraseña
          </CButton>
        </div>
      </div>

      {mensaje && <p className="mt-3 text-success">{mensaje}</p>}

      {/* Modal contraseña */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader><CModalTitle>Cambiar contraseña</CModalTitle></CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="fw-bold">Contraseña actual</label>
            <input
              type="password"
              className="form-control"
              value={passForm.actual}
              onChange={(e) => setPassForm((prev) => ({ ...prev, actual: e.target.value }))}
            />
          </div>

          <div className="mb-3">
            <label className="fw-bold">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              value={passForm.nueva}
              onChange={(e) => setPassForm((prev) => ({ ...prev, nueva: e.target.value }))}
            />
          </div>

          <div className="mb-3">
            <label className="fw-bold">Repetir nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              value={passForm.repetir}
              onChange={(e) => setPassForm((prev) => ({ ...prev, repetir: e.target.value }))}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
          <CButton color="info" onClick={validarYGuardarPassword}>Guardar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
