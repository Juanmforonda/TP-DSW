export function validarUbicacionExclusiva(
  amarraId: unknown,
  boxId: unknown
) {
  const tieneAmarra = amarraId !== undefined && amarraId !== null;
  const tieneBox = boxId !== undefined && boxId !== null;

  if (!tieneAmarra && !tieneBox) {
    throw new Error(
      'Debes asignar una amarra o un box para crear la embarcación'
    );
  }

  if (tieneAmarra && tieneBox) {
    throw new Error(
      'La embarcación no puede asignarse simultáneamente a amarra y box'
    );
  }
}