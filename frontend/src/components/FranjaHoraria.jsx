import React, { useState, useMemo, useEffect } from 'react';
import { CButton, CFormLabel } from '@coreui/react';

// Props:
// dateLocal: 'YYYY-MM-DD' or ''
// reservas: array de reservas con { id, fechaInicio, fechaFin, estado }
// excludeReservaId?: id para excluir cuando editás
// onChange({ inicioLocal, finLocal }) -> datetime-local strings
export default function TimeSlotPicker({
  dateLocal,
  reservas = [],
  onChange,
  slotMinutes = 30,
  maxHours = 3,
  excludeReservaId = null,
}) {
  const [startSlot, setStartSlot] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(60);

  // asegurar duration <= maxHours
  useEffect(() => {
    const maxMin = maxHours * 60;
    if (durationMinutes > maxMin) setDurationMinutes(maxMin);
  }, [maxHours]);

  // generar slots del día (ajustá rango si hace falta)
  const dayStart = 7;
  const dayEnd = 22;
  const slots = useMemo(() => {
    if (!dateLocal) return [];
    const arr = [];
    for (let h = dayStart; h < dayEnd; h++) {
      for (let m = 0; m < 60; m += slotMinutes) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        arr.push(`${dateLocal}T${hh}:${mm}`);
      }
    }
    return arr;
  }, [dateLocal, slotMinutes]);

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
  }

  // reservar sólo las reservas ACTIVAS y excluir la que estamos editando (si aplica)
  const reservasActivas = useMemo(
    () =>
      reservas.filter(
        (r) =>
          r &&
          (r.estado ?? '').toUpperCase() === 'ACTIVA' &&
          r.id !== excludeReservaId
      ),
    [reservas, excludeReservaId]
  );

  function slotDisabled(slotLocal, durMin = durationMinutes) {
    if (!slotLocal) return true;

    const inicio = new Date(slotLocal);
    const fin = new Date(inicio.getTime() + durMin * 60000);

    // No permitir horarios anteriores al momento actual.
    const ahora = new Date();

    if (inicio < ahora) return true;

    // No permitir reservas de fechas anteriores a hoy.
    const fechaHoy = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, '0'),
      String(ahora.getDate()).padStart(2, '0'),
    ].join('-');

    if (dateLocal < fechaHoy) return true;

    // No permitir horarios que se superpongan con otras reservas activas.
    for (const r of reservasActivas) {
      const ri = new Date(r.fechaInicio);
      const rf = new Date(r.fechaFin);

      if (isNaN(ri.getTime()) || isNaN(rf.getTime())) continue;

      if (overlaps(inicio, fin, ri, rf)) return true;
    }

    return false;
  }

  function fmtForDatetimeLocal(d) {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  function selectStart(s) {
    const maxMin = maxHours * 60;
    const dur = Math.min(durationMinutes, maxMin);
    if (slotDisabled(s, dur)) return;
    setStartSlot(s);
    const inicio = new Date(s);
    const fin = new Date(inicio.getTime() + dur * 60000);
    onChange &&
      onChange({
        inicioLocal: fmtForDatetimeLocal(inicio),
        finLocal: fmtForDatetimeLocal(fin),
      });
  }

  function changeDuration(dMin) {
    const maxMin = maxHours * 60;
    const newDur = Math.min(dMin, maxMin);
    setDurationMinutes(newDur);
    if (!startSlot) return;
    const inicio = new Date(startSlot);
    const fin = new Date(inicio.getTime() + newDur * 60000);
    const disabled = reservasActivas.some((r) =>
      overlaps(inicio, fin, new Date(r.fechaInicio), new Date(r.fechaFin))
    );
    if (!disabled)
      onChange &&
        onChange({
          inicioLocal: fmtForDatetimeLocal(inicio),
          finLocal: fmtForDatetimeLocal(fin),
        });
  }

  const durationOptions = [slotMinutes, 60, 120, 180].filter(
    (d) => d <= maxHours * 60
  );

  return (
    <div>
      <CFormLabel>Seleccionar horario</CFormLabel>
      <div className="d-flex gap-2 flex-wrap mb-2">
        {durationOptions.map((d) => (
          <CButton
            key={d}
            color={durationMinutes === d ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => changeDuration(d)}
          >
            {d >= 60 ? `${d / 60}h` : `${d}m`}
          </CButton>
        ))}
      </div>

      <div
        style={{
          maxHeight: 220,
          overflowY: 'auto',
          border: '1px solid #eee',
          padding: 8,
          borderRadius: 6,
        }}
      >
        {slots.length === 0 && (
          <div className="text-muted">Seleccioná primero la fecha</div>
        )}
        {slots.map((s) => {
          const disabled = slotDisabled(s);
          const selected = s === startSlot;
          return (
            <CButton
              key={s}
              className="me-1 mb-1"
              size="sm"
              color={selected ? 'info' : disabled ? 'light' : 'outline-primary'}
              onClick={() => selectStart(s)}
              disabled={disabled}
            >
              {s.slice(11)}
            </CButton>
          );
        })}
      </div>

      <div className="mt-2">
        <CFormLabel>Inicio seleccionado</CFormLabel>
        <div>
          {startSlot ? startSlot.slice(11) : '—'} — Duración:{' '}
          {durationMinutes / 60}h (máx {maxHours}h)
        </div>
      </div>
    </div>
  );
}
