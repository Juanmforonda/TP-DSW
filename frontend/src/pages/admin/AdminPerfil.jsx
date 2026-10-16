import { useEffect, useState } from 'react';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react';
import { getAdministradores, actualizarAdministrador } from '../../api/administradores';
import '../../components/AdminHome.css';


export function AdminPerfil({ idAdmin }) {
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState({ email: '', nombre: '', apellido: '' });
  const [editando, setEditando] = useState({ email: false, nombre: false, apellido: false });
  const [modalVisible, setModalVisible] = useState(false);
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', repetir: '' });
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    getAdministradores()
      .then((res) => {
        const todos = res.data?.data ?? [];
        const actual = todos.find((s) => s.id === idAdmin);
        if (actual) {
          setAdmin(actual);
          setForm({
            email: actual.email,
            nombre: actual.nombre,
            apellido: actual.apellido,
          });
        }
      })
      .catch((err) => console.error('❌ Error al cargar perfil:', err));
  }, [idAdmin]);

  const handleGuardarCampo = async (campo) => {
    try {
      await actualizarAdministrador(idAdmin, { [campo]: form[campo] });
      setEditando((prev) => ({ ...prev, [campo]: false }));
      setAdmin((prev) => ({ ...prev, [campo]: form[campo] }));
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
      await actualizarAdministrador(idAdmin, { password: nueva });
      alert('Contraseña actualizada');
      setModalVisible(false);
      setPassForm({ actual: '', nueva: '', repetir: '' });
    } catch (error) {
      console.error('❌ Error al actualizar contraseña:', error);
      alert('Error al actualizar contraseña');
    }
  };

  if (!admin) return <p>Cargando perfil...</p>;

  return (
    <div className="perfil-card">
      <h3 className="perfil-titulo">Mi perfil</h3>

      <div className="mb-3">
        <label className="fw-bold">ID:</label>
        <div>{admin.id}</div>
      </div>

      {/* Apellido */}
      <div className="mb-3">
        <label className="fw-bold">Apellido</label>
        {editando.apellido ? (
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              value={form.apellido}
              onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))}
            />
            <CButton size="sm" color="primary" onClick={() => handleGuardarCampo('apellido')}>
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{admin.apellido}</span>
            <CButton size="sm" color="primary" variant="outline" onClick={() => setEditando((prev) => ({ ...prev, apellido: true }))}>
              Modificar
            </CButton>
          </div>
        )}
      </div>

      {/* Nombre */}
      <div className="mb-3">
        <label className="fw-bold">Nombre</label>
        {editando.nombre ? (
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              value={form.nombre}
              onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
            />
            <CButton size="sm" color="primary" onClick={() => handleGuardarCampo('nombre')}>
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{admin.nombre}</span>
            <CButton size="sm" color="primary" variant="outline" onClick={() => setEditando((prev) => ({ ...prev, nombre: true }))}>
              Modificar
            </CButton>
          </div>
        )}
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
            <CButton size="sm" color="primary" onClick={() => handleGuardarCampo('email')}>
              Guardar
            </CButton>
          </div>
        ) : (
          <div className="d-flex justify-content-between align-items-center">
            <span>{admin.email}</span>
            <CButton size="sm" color="primary" variant="outline" onClick={() => setEditando((prev) => ({ ...prev, email: true }))}>
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
          <CButton size="sm" color="primary" variant="outline" onClick={() => setModalVisible(true)}>
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
          <CButton color="primary" onClick={validarYGuardarPassword}>Guardar</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
