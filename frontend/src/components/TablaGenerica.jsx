import React, { useState, useEffect } from 'react';
import './tablaSocios.css';
import { getEmbarcaciones } from '../api/embarcaciones.js';

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

export function EntityTable({ columns, data, entityName, onDelete, onEdit }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [embarcaciones, setEmbarcaciones] = useState([]);

  // Para "amarra" y "box" el modal de edición necesita la lista de
  // embarcaciones disponibles para poder asignarlas/desasignarlas.
  useEffect(() => {
    if ((entityName === 'amarra' || entityName === 'box') && modalEditOpen) {
      getEmbarcaciones()
        .then((res) => setEmbarcaciones(res.data.data || []))
        .catch((error) => console.error('Error al cargar embarcaciones:', error));
    }
  }, [entityName, modalEditOpen]);

  const abrirEliminar = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const abrirEditar = (item) => {
    setSelected(item);
    setModalEditOpen(true);
  };

  // Id de la embarcación actualmente asignada a la amarra seleccionada
  // (puede venir como objeto populado o como id plano).
  const embarcacionSeleccionadaId = (() => {
    const emb = selected?.embarcacion;
    if (emb === null || emb === undefined) return '';
    return typeof emb === 'object' ? emb.id : emb;
  })();

  // Campo de la embarcación que apunta a esta entidad ('amarra' o 'box'),
  // usado para saber qué embarcaciones ya están ocupadas por otra fila.
  const campoRelacionInverso = entityName === 'box' ? 'box' : 'amarra';

  const handleEmbarcacionChange = (value) => {
    const embarcacionId = value === '' ? null : Number(value);
    const estadoSinEmbarcacion = entityName === 'box' ? 'disponible' : 'libre';
    setSelected({
      ...selected,
      embarcacion: embarcacionId,
      estado: embarcacionId ? 'ocupado' : estadoSinEmbarcacion,
    });
  };

  const confirmarEliminar = () => {
    onDelete(selected.id);
    setModalOpen(false);
  };

  const handleChange = (field, value) => {
    setSelected({ ...selected, [field]: value });
  };

  const guardarCambios = () => {
    // Convertir campos numéricos a números
    const datosActualizados = { ...selected };
    if (datosActualizados.precioMensualBase) {
      datosActualizados.precioMensualBase = Number(datosActualizados.precioMensualBase);
    }
    if (datosActualizados.longitudMax) {
      datosActualizados.longitudMax = Number(datosActualizados.longitudMax);
    }
    if (datosActualizados.nroPilon) {
      datosActualizados.nroPilon = Number(datosActualizados.nroPilon);
    }
    if ((entityName === 'amarra' || entityName === 'box') && typeof datosActualizados.embarcacion === 'object') {
      datosActualizados.embarcacion = datosActualizados.embarcacion?.id ?? null;
    }
    onEdit(selected.id, datosActualizados);
    setModalEditOpen(false);
  };

  return (
    <div className="table-container">
      <CTable striped hover bordered borderColor="primary" responsive className='c-table-custom'>
        <CTableHead>
          <CTableRow>
            {columns.map((col) => (
              <CTableHeaderCell key={col.key}>{col.label}</CTableHeaderCell>
            ))}
            {onEdit && <CTableHeaderCell></CTableHeaderCell>}
            {onDelete && <CTableHeaderCell></CTableHeaderCell>}
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
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Modal Eliminar */}
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

      {/* Modal Editar */}
      <CModal visible={modalEditOpen} onClose={() => setModalEditOpen(false)}>
        <CModalHeader>Editar {entityName}</CModalHeader>
        <CModalBody>
          {columns.map((col) => {
            // El ID nunca es editable, en ningún formulario.
            if (col.key === 'id') {
              return null;
            }
            // En "amarra" el estado se calcula automáticamente según si
            // tiene o no una embarcación asignada, así que no se edita a mano.
            if (col.key === 'estado' && entityName === 'amarra') {
              return null;
            }
            // En "box" el estado también se deriva de la embarcación asignada
            // (ocupado/disponible), salvo que se lo ponga manualmente en
            // "mantenimiento" cuando no tiene ninguna embarcación asignada.
            if (col.key === 'estado' && entityName === 'box') {
              const tieneEmbarcacion = !!embarcacionSeleccionadaId;
              return (
                <div key={col.key} className="mb-3">
                  <label className="form-label">{col.label}</label>
                  {tieneEmbarcacion ? (
                    <>
                      <CFormInput value="Ocupado" disabled />
                      <small className="text-muted">
                        El box está ocupado porque tiene una embarcación asignada. Quitala para poder ponerlo en mantenimiento.
                      </small>
                    </>
                  ) : (
                    <select
                      className="form-select"
                      value={selected?.estado === 'mantenimiento' ? 'mantenimiento' : 'disponible'}
                      onChange={(e) => handleChange('estado', e.target.value)}
                    >
                      <option value="disponible">Disponible</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  )}
                </div>
              );
            }
            if (col.key === 'estado') {
              return (
                <div key={col.key} className="mb-3">
                  <label className="form-label">{col.label}</label>
                  <select
                    className="form-select"
                    value={selected?.[col.key] || ''}
                    onChange={(e) => handleChange(col.key, e.target.value)}
                  >
                    <option value="">Seleccione un estado</option>
                    {entityName === 'box' ? (
                      <>
                        <option value="disponible">Disponible</option>
                        <option value="ocupado">Ocupado</option>
                        <option value="mantenimiento">Mantenimiento</option>
                      </>
                    ) : (
                      <>
                        <option value="libre">Libre</option>
                        <option value="ocupado">Ocupado</option>
                      </>
                    )}
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
            if (col.key === 'precioMensualBase' || col.key === 'longitudMax' || col.key === 'nroPilon') {
              return (
                <div key={col.key} className="mb-3">
                  <label className="form-label">{col.label}</label>
                  <CFormInput
                    type="number"
                    value={selected?.[col.key] || ''}
                    onChange={(e) => handleChange(col.key, Number(e.target.value))}
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

          {(entityName === 'amarra' || entityName === 'box') && (
            <div className="mb-3">
              <label className="form-label">Embarcación</label>
              <select
                className="form-select"
                value={embarcacionSeleccionadaId}
                onChange={(e) => handleEmbarcacionChange(e.target.value)}
              >
                <option value="">
                  {entityName === 'box' ? 'Sin embarcación (disponible)' : 'Sin embarcación (libre)'}
                </option>
                {embarcaciones
                  .filter(
                    (e) => !e[campoRelacionInverso] || e.id === embarcacionSeleccionadaId
                  )
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} — {e.matricula}
                    </option>
                  ))}
              </select>
              <small className="text-muted">
                {entityName === 'box'
                  ? 'El estado se actualiza automáticamente: "ocupado" si tiene una embarcación asignada, "disponible" si no (salvo que lo pongas en mantenimiento).'
                  : 'El estado de la amarra se actualiza automáticamente: "ocupado" si tiene una embarcación asignada, "libre" si no.'}
              </small>
            </div>
          )}
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
