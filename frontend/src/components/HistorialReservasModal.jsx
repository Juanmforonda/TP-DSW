import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react';

export default function HistorialReservasModal({
  visible,
  onClose,
  reservas,
  tipo,
}) {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="lg"
    >
      <CModalHeader>
        Historial de reservas
      </CModalHeader>

      <CModalBody>
        {reservas.length === 0 ? (
          <p>
            Este {tipo} no tiene reservas registradas.
          </p>
        ) : (
          <CTable striped bordered small>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>
                  Embarcación
                </CTableHeaderCell>

                <CTableHeaderCell>
                  Socio
                </CTableHeaderCell>

                <CTableHeaderCell>
                  Fecha Inicio
                </CTableHeaderCell>

                <CTableHeaderCell>
                  Fecha Fin
                </CTableHeaderCell>

                <CTableHeaderCell>
                  Estado
                </CTableHeaderCell>

                <CTableHeaderCell>
                  Precio
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {reservas.map((r) => (
                <CTableRow key={r.id}>
                  <CTableDataCell>
                    {r.embarcacion?.nombre ?? '—'}
                  </CTableDataCell>

                  <CTableDataCell>
                    {r.socio
                      ? `${r.socio.nombre} ${r.socio.apellido}`
                      : '—'}
                  </CTableDataCell>

                  <CTableDataCell>
                    {new Date(
                      r.fechaInicio
                    ).toLocaleDateString()}
                  </CTableDataCell>

                  <CTableDataCell>
                    {r.fechaFin
                      ? new Date(
                          r.fechaFin
                        ).toLocaleDateString()
                      : 'Vigente'}
                  </CTableDataCell>

                  <CTableDataCell>
                    {r.estado}
                  </CTableDataCell>

                  <CTableDataCell>
                    ${r.precioMensualFinal}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CModalBody>

      <CModalFooter>
        <CButton
          color="secondary"
          onClick={onClose}
        >
          Cerrar
        </CButton>
      </CModalFooter>
    </CModal>
  );
}