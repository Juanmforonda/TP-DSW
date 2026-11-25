import { HttpError } from '../shared/http-errors.js';

export function validarFechas(
  inicio: Date,
  fin?: Date | null
) {
  if (Number.isNaN(inicio.getTime())) {
    throw new HttpError(400, 'La fecha de inicio es inválida');
  }

  if (fin && Number.isNaN(fin.getTime())) {
    throw new HttpError(400, 'La fecha de fin es inválida');
  }

  if (fin && inicio > fin) {
    throw new HttpError(400,
      'La fecha de inicio debe ser anterior o igual a la fecha de fin'
    );
  }
}