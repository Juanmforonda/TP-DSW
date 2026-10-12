import React, { useEffect, useMemo, useState } from 'react';
import { CButton, CFormLabel } from '@coreui/react';

export default function TravelLiftTimePicker({ dateLocal, reservas = [], excludeId, onChange }) {
  const [selected, setSelected] = useState('');

  useEffect(() => setSelected(''), [dateLocal]);

  const slots = useMemo(() => {
    if (!dateLocal) return [];
    return Array.from({ length: 10 }, (_, index) => {
      const hour = String(index + 8).padStart(2, '0');
      return `${dateLocal}T${hour}:00`;
    });
  }, [dateLocal]);

  const activeReservations = reservas.filter(
    (reserva) => reserva?.estado === 'ACTIVA' && reserva.id !== excludeId
  );

  function isDisabled(slot) {
    const start = new Date(slot);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return activeReservations.some((reserva) => {
      const reservationStart = new Date(reserva.fechaHoraInicio);
      const reservationEnd = new Date(reserva.fechaHoraFin);
      return start < reservationEnd && end > reservationStart;
    });
  }

  function selectSlot(slot) {
    if (isDisabled(slot)) return;
    setSelected(slot);
    const end = new Date(new Date(slot).getTime() + 60 * 60 * 1000);
    const endLocal = `${dateLocal}T${String(end.getHours()).padStart(2, '0')}:00`;
    onChange?.({ inicioLocal: slot, finLocal: endLocal });
  }

  return (
    <div>
      <CFormLabel>Horario (duración fija: 1 hora)</CFormLabel>
      <div className="d-flex gap-2 flex-wrap">
        {slots.map((slot) => (
          <CButton
            key={slot}
            size="sm"
            color={selected === slot ? 'info' : isDisabled(slot) ? 'light' : 'outline-primary'}
            disabled={isDisabled(slot)}
            onClick={() => selectSlot(slot)}
          >
            {slot.slice(11)}
          </CButton>
        ))}
      </div>
      {!dateLocal && <div className="text-muted mt-2">Seleccioná primero una fecha.</div>}
    </div>
  );
}
