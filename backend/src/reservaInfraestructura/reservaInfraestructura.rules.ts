export function validarFechas(
  inicio: Date,
  fin?: Date | null
) {
  if (Number.isNaN(inicio.getTime())) {
    throw new Error('La fecha de inicio es inválida');
  }

  if (fin && Number.isNaN(fin.getTime())) {
    throw new Error('La fecha de fin es inválida');
  }

  if (fin && inicio > fin) {
    throw new Error(
      'La fecha de inicio debe ser anterior o igual a la fecha de fin'
    );
  }
}