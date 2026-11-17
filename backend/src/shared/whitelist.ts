import { Response } from 'express';

// Devuelve solo los campos permitidos y la lista de los que sobran.
// 'sanitizedInput' se ignora porque lo agregan los middlewares de sanitización.
export function filtrarCampos(body: unknown, permitidos: readonly string[]) {
  const origen = (body ?? {}) as Record<string, any>;
  const datos: Record<string, any> = {};
  const rechazados: string[] = [];

  for (const key of Object.keys(origen)) {
    if (key === 'sanitizedInput') continue;
    if (permitidos.includes(key)) {
      datos[key] = origen[key];
    } else {
      rechazados.push(key);
    }
  }

  return { datos, rechazados };
}

export function camposNoPermitidos(res: Response, rechazados: string[]) {
  return res.status(400).json({
    message: 'Se enviaron campos que no se pueden modificar',
    campos: rechazados,
  });
}