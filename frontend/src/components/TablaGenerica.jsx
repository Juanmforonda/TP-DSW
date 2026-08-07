import React, { useState } from 'react';
import './tablaSocios.css';

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

export function EntityTable({
  columns,
  data,
  entityName,
  onDelete,
  onEdit,
  extraActions,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const abrirEliminar = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const abrirEditar = (item) => {
    setSelected(item);
    setModalEditOpen(true);
  };

  const confirmarEliminar = () => {
    onDelete(selected.id);
    setModalOpen(false);
  };

  const handleChange = (field, value) => {
    setSelected({ ...selected, [field]: value });
  };

  const guardarCambios = () => {
    const datosActualizados = { ...selected };
    columns.forEach((col) => {
    if (col.readonly) {
      delete datosActualizados[col.key];
    }});

    if (datosActualizados.precioMensualBase !== undefined) {
      datosActualizados.precioMensualBase = Number(
        datosActualizados.precioMensualBase,
      );
    }
    if (datosActualizados.longitudMax !== undefined) {
      datosActualizados.longitudMax = Number(datosActualizados.longitudMax);
    }
    if (datosActualizados.nroPilon !== undefined) {
      datosActualizados.nroPilon = Number(datosActualizados.nroPilon);
    }
    onEdit(selected.id, datosActualizados);
    setModalEditOpen(false);
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
            {columns.map((col) => (
              
              <CTableHeaderCell key={col.key}>{col.label}</CTableHeaderCell>
            ))}
            {onEdit && <CTableHeaderCell></CTableHeaderCell>}
            {onDelete && <CTableHeaderCell></CTableHeaderCell>}
            {extraActions && <CTableHeaderCell></CTableHeaderCell>}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {data.map((item) => (
            <CTableRow key={item.id}>
              {columns.map((col) => (
                <CTableDataCell key={col.key}>{item[col.key]}</CTableDataCell>
              ))}
              {onEdit && (
                <CTableDataCell>
                  <CButton
                    color="warning"
                    size="sm"
                    onClick={() => abrirEditar(item)}
                  >
                    Editar
                  </CButton>
                </CTableDataCell>
              )}
              {onDelete && (
                <CTableDataCell>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => abrirEliminar(item)}
                  >
                    Eliminar
                  </CButton>
                </CTableDataCell>
              )}
              {extraActions && (
                <CTableDataCell>{extraActions(item)}</CTableDataCell>
              )}
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <CModalHeader>Confirmar eliminación</CModalHeader>
        <CModalBody>
          ¿Estás seguro de que quieres eliminar este {entityName}?
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

      <CModal visible={modalEditOpen} onClose={() => setModalEditOpen(false)}>
        <CModalHeader>Editar {entityName}</CModalHeader>
        <CModalBody>
          {columns.map((col) => {
            if (col.key === 'id') return null;
            if (col.readonly) return null;

            if (col.key === 'estado') {
              const opciones =
                entityName === 'box'
                  ? ['disponible', 'ocupado', 'mantenimiento']
                  : ['libre', 'ocupado', 'mantenimiento'];
              return (
                <div key={col.key} className="mb-3">
                  <label className="form-label">{col.label}</label>
                  <select
                    className="form-select"
                    value={selected?.[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value)}
                  >
                    <option value="">Seleccione un estado</option>
                    {opciones.map((op) => (
                      <option key={op} value={op}>
                        {op.charAt(0).toUpperCase() + op.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (col.key === 'zona') {
              return (
                <div key={col.key} className="mb-3">
                  <label className="form-label">{col.label}</label>
                  <select
                    className="form-select"
                    value={selected?.[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value)}
                  >
                    <option value="">Seleccione una zona</option>
                    <option value="Norte">Norte</option>
                    <option value="Sur">Sur</option>
                    <option value="Este">Este</option>
                    <option value="Oeste">Oeste</option>
                  </select>
                </div>
              );
            }

            if (
              col.key === 'precioMensualBase' ||
              col.key === 'longitudMax' ||
              col.key === 'nroPilon'
            ) {
              return (
                <div key={col.key} className="mb-3">
                  <label className="form-label">{col.label}</label>
                  <CFormInput
                    type="number"
                    value={selected?.[col.key] || ''}
                    onChange={(e) =>
                      handleChange(col.key, Number(e.target.value))
                    }
                  />
                </div>
              );
            }

            return (
              <div key={col.key} className="mb-3">
                <label className="form-label">{col.label}</label>
                <CFormInput
                  value={selected?.[col.key] || ''}
                  onChange={(e) => handleChange(col.key, e.target.value)}
                />
              </div>
            );
          })}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalEditOpen(false)}>
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
