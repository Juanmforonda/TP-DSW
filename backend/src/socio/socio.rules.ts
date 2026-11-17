import { EstadoReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { Estado as EstadoAmarra } from '../amarra/amarra.entity.js';
import { Estado as EstadoBox } from '../box/box.entity.js';
import { EstadoReservaTravelLift } from '../reservaTravelLift/reservaTravelLift.entity.js';

export interface EntidadConFechaFin {
  fechaFin?: Date | null;
}

export interface ReservaInfraestructuraBaja {
  estado: EstadoReservaInfraestructura;
  fechaFin?: Date | null;
  amarra?: { estado: EstadoAmarra } | null;
  box?: { estado: EstadoBox } | null;
}

export interface ReservaTravelLiftBaja {
  estado: EstadoReservaTravelLift;
}

export interface ReservaEmbarcacionClubBaja {
  estado: string;
}

export interface DatosBajaLogicaSocio {
  afiliacionActiva: EntidadConFechaFin;
  embarcaciones: EntidadConFechaFin[];
  reservasInfraestructura: ReservaInfraestructuraBaja[];
  reservasTravelLift?: ReservaTravelLiftBaja[];
  reservasClub?: ReservaEmbarcacionClubBaja[];
}

/**
 * Aplica las reglas de baja lógica para un socio:
 * 1. Cierra la afiliación activa estableciendo su fechaFin.
 * 2. Marca todas las embarcaciones del socio como inactivas (fechaFin) sin eliminarlas físicamente.
 * 3. Cierra las reservas de infraestructura activas (CANCELADA + fechaFin) y libera amarras/boxes ocupados,
 *    conservando todas las reservas históricas.
 * 4. Cierra las reservas activas de Travel Lift y reservas de embarcaciones del club.
 */
export function procesarBajaLogicaSocio(
  datos: DatosBajaLogicaSocio,
  fechaBaja: Date = new Date()
) {
  // 1. Cerrar la afiliación activa
  datos.afiliacionActiva.fechaFin = fechaBaja;

  // 2. Marcar embarcaciones como inactivas sin eliminarlas
  for (const embarcacion of datos.embarcaciones) {
    if (!embarcacion.fechaFin) {
      embarcacion.fechaFin = fechaBaja;
    }
  }

  // 3. Cerrar reservas de infraestructura activas y liberar amarras/boxes
  for (const reserva of datos.reservasInfraestructura) {
    if (reserva.estado === EstadoReservaInfraestructura.ACTIVA) {
      reserva.estado = EstadoReservaInfraestructura.CANCELADA;
      reserva.fechaFin = reserva.fechaFin ?? fechaBaja;

      if (reserva.amarra && reserva.amarra.estado !== EstadoAmarra.MANTENIMIENTO) {
        reserva.amarra.estado = EstadoAmarra.LIBRE;
      }
      if (reserva.box && reserva.box.estado !== EstadoBox.MANTENIMIENTO) {
        reserva.box.estado = EstadoBox.DISPONIBLE;
      }
    }
  }

  // 4. Cerrar reservas activas de Travel Lift
  if (datos.reservasTravelLift) {
    for (const reserva of datos.reservasTravelLift) {
      if (reserva.estado === EstadoReservaTravelLift.ACTIVA) {
        reserva.estado = EstadoReservaTravelLift.CANCELADA;
      }
    }
  }

  // 5. Cerrar reservas activas de embarcaciones del club
  if (datos.reservasClub) {
    for (const reserva of datos.reservasClub) {
      if (reserva.estado === 'ACTIVA') {
        reserva.estado = 'CANCELADA';
      }
    }
  }
}
