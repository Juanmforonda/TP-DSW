export function unwrapResponse(response) {
  if (!response) return null;
  return response.data !== undefined ? response.data : response;
}

export function listFromResponse(response) {
  const data = unwrapResponse(response);
  return Array.isArray(data) ? data : data?.data ?? data?.reservas ?? [];
}

export function toLocalDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toISOStringOrNull(value) {
  const date = toLocalDateTime(value);
  return date ? date.toISOString() : null;
}

export function toDateTimeLocal(value) {
  const date = toLocalDateTime(value);
  if (!date) return '';
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function formatReservationDate(value, locale = 'es-AR') {
  const date = toLocalDateTime(value);
  return date ? date.toLocaleString(locale) : '-';
}

export function reservationsOverlap(start, end, otherStart, otherEnd) {
  return start < otherEnd && end > otherStart;
}

export function validateReservationRange(
  startValue,
  endValue,
  reservations = [],
  excludeId,
  maxHours = 3
) {
  const start = toLocalDateTime(startValue);
  const end = toLocalDateTime(endValue);

  if (!start || !end) return 'Fechas inválidas';
  if (start >= end) return 'La fecha de inicio debe ser anterior a la fecha de fin';
  if (end.getTime() - start.getTime() > maxHours * 60 * 60 * 1000) {
    return `La reserva no puede durar más de ${maxHours} horas`;
  }

  const activeReservations = reservations.filter(
    (reservation) =>
      reservation &&
      String(reservation.estado ?? '').toUpperCase() === 'ACTIVA' &&
      reservation.id !== excludeId
  );

  for (const reservation of activeReservations) {
    const reservationStart = toLocalDateTime(reservation.fechaInicio);
    const reservationEnd = toLocalDateTime(reservation.fechaFin);
    if (
      reservationStart &&
      reservationEnd &&
      reservationsOverlap(start, end, reservationStart, reservationEnd)
    ) {
      return 'La embarcación ya tiene una reserva en ese horario';
    }
  }

  return null;
}
