import React from 'react';
import './tablaSocios.css';
import { useState } from 'react';
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
} from '@coreui/react';

/*id nombre dni email telefono*/
export function TablaSocios({ users, onEliminar, onEditar }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [socioEditar, setSocioEditar] = useState(null);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);

  const abrirModal = (socio) => {
    setSocioSeleccionado(socio);
    setModalOpen(true);
  };

  const abrirModalEditar = (socio) => {
    setSocioEditar(socio);
    setModalEditarOpen(true);
  };

  const confirmarEliminar = () => {
    if (onEliminar && socioSeleccionado) {
      onEliminar(socioSeleccionado.id);
    }
    setModalOpen(false);
  };

  const handleChange = (field, value) => {
    setSocioEditar({ ...socioEditar, [field]: value });
  };

  const guardarCambios = () => {
    onEditar(socioEditar.id, socioEditar);
    setModalEditarOpen(false);
  };

  return (
    <div className="table-container">
      <CTable
        striped
        hover
        bordered
        borderColor="primary"
        responsive
        className="c-table-custom"
      >
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Apellido</CTableHeaderCell>
            <CTableHeaderCell>DNI</CTableHeaderCell>
            <CTableHeaderCell>E-Mail</CTableHeaderCell>
            <CTableHeaderCell>Telefono</CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
            <CTableHeaderCell></CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users.map(({ id, nombre, apellido, dni, email, telefono }) => (
            <CTableRow key={id}>
              <CTableDataCell>{id}</CTableDataCell>
              <CTableDataCell>{nombre}</CTableDataCell>
              <CTableDataCell>{apellido}</CTableDataCell>
              <CTableDataCell>{dni}</CTableDataCell>
              <CTableDataCell>{email}</CTableDataCell>
              <CTableDataCell>{telefono}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() =>
                    abrirModalEditar({
                      id,
                      nombre,
                      apellido,
                      dni,
                      email,
                      telefono,
                    })
                  }
                >
                  Editar
                </CButton>
              </CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="danger"
                  size="sm"
                  onClick={() => abrirModal({ id, nombre, apellido })}
                >
                  Eliminar
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader>Confirmar eliminación</CModalHeader>
        <CModalBody>
          ¿Estás seguro que querés eliminar a{' '}
          <b>
            {socioSeleccionado?.nombre} {socioSeleccionado?.apellido}
          </b>
          ?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmarEliminar}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
      >
        <CModalHeader>Editar Socio</CModalHeader>
        <CModalBody>
          <CFormInput
            label="Nombre"
            value={socioEditar?.nombre || ''}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          <CFormInput
            label="Apellido"
            value={socioEditar?.apellido || ''}
            onChange={(e) => handleChange('apellido', e.target.value)}
          />
          <CFormInput
            label="DNI"
            value={socioEditar?.dni || ''}
            onChange={(e) => handleChange('dni', e.target.value)}
          />
          <CFormInput
            label="Email"
            value={socioEditar?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          <CFormInput
            label="Teléfono"
            value={socioEditar?.telefono || ''}
            onChange={(e) => handleChange('telefono', e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalEditarOpen(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={guardarCambios}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
