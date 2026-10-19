import type {
  EntityData,
  EntityManager,
  EntityName,
  FilterQuery,
} from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Administrador } from '../administrador/administrador.entity.js';
import { Afiliacion } from '../afiliacion/afiliacion.entity.js';
import { Amarra, Estado as EstadoAmarra } from '../amarra/amarra.entity.js';
import { Box, Estado as EstadoBox } from '../box/box.entity.js';
import {
  CuotaMensual,
  MetodoPago,
} from '../cuotaMensual/cuotaMensual.entity.js';
import { DetalleCuota } from '../detalleCuota/detalleCuota.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import {
  EstadoReservaInfraestructura,
  ReservaInfraestructura,
} from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { ReservaEmbarcacionClub } from '../reservaEmbarcacionClub/reservaEmbarcacionClub.entity.js';
import {
  EstadoReservaTravelLift,
  ReservaTravelLift,
} from '../reservaTravelLift/reservaTravelLift.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { TipoEmbarcacion } from '../tipoEmbarcacion/tipoEmbarcacion.entity.js';

async function findOrCreate<T extends object>(
  em: EntityManager,
  entity: EntityName<T>,
  where: FilterQuery<T>,
  data: EntityData<T>,
): Promise<T> {
  const existing = await em.findOne(entity, where);
  if (existing) {
    return existing;
  }

  const created = em.create(entity, data as never);
  em.persist(created);
  return created;
}

function dateAt(daysFromToday: number, hour = 10): Date {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date;
}

export class DemoSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const tipos = await this.seedTipos(em);
    const recursos = await this.seedRecursos(em);
    const usuarios = await this.seedUsuarios(em);
    await em.flush();

    const embarcaciones = await this.seedEmbarcaciones(em, tipos, usuarios);
    await this.seedAfiliaciones(em, usuarios);
    await em.flush();

    const reservasInfraestructura = await this.seedReservasInfraestructura(
      em,
      recursos,
      usuarios,
      embarcaciones,
    );
    await this.seedReservasClubYTravelLift(em, usuarios, embarcaciones);
    await this.seedCuotas(em, usuarios, reservasInfraestructura);
    await em.flush();
  }

  private async seedTipos(em: EntityManager) {
    const lancha = await findOrCreate(
      em,
      TipoEmbarcacion,
      { nombre: 'Lancha' },
      { nombre: 'Lancha', esloraMaxima: 12 },
    );
    const velero = await findOrCreate(
      em,
      TipoEmbarcacion,
      { nombre: 'Velero' },
      { nombre: 'Velero', esloraMaxima: 30 },
    );
    const kayak = await findOrCreate(
      em,
      TipoEmbarcacion,
      { nombre: 'Kayak' },
      { nombre: 'Kayak', esloraMaxima: 6 },
    );
    return { lancha, velero, kayak };
  }

  private async seedRecursos(em: EntityManager) {
    const box1 = await findOrCreate(
      em,
      Box,
      { nroBox: 'B-01' },
      {
        nroBox: 'B-01',
        estado: EstadoBox.OCUPADO,
        precioMensualBase: 85000,
      },
    );
    const box2 = await findOrCreate(
      em,
      Box,
      { nroBox: 'B-02' },
      {
        nroBox: 'B-02',
        estado: EstadoBox.DISPONIBLE,
        precioMensualBase: 90000,
      },
    );
    const box3 = await findOrCreate(
      em,
      Box,
      { nroBox: 'B-03' },
      {
        nroBox: 'B-03',
        estado: EstadoBox.MANTENIMIENTO,
        precioMensualBase: 95000,
      },
    );
    const amarra1 = await findOrCreate(
      em,
      Amarra,
      { nroPilon: 101 },
      {
        nroPilon: 101,
        zona: 'Norte',
        longitudMax: 10,
        estado: EstadoAmarra.OCUPADO,
        precioMensualBase: 110000,
      },
    );
    const amarra2 = await findOrCreate(
      em,
      Amarra,
      { nroPilon: 102 },
      {
        nroPilon: 102,
        zona: 'Norte',
        longitudMax: 15,
        estado: EstadoAmarra.LIBRE,
        precioMensualBase: 125000,
      },
    );
    const amarra3 = await findOrCreate(
      em,
      Amarra,
      { nroPilon: 201 },
      {
        nroPilon: 201,
        zona: 'Sur',
        longitudMax: 20,
        estado: EstadoAmarra.MANTENIMIENTO,
        precioMensualBase: 140000,
      },
    );
    return { box1, box2, box3, amarra1, amarra2, amarra3 };
  }

  private async seedUsuarios(em: EntityManager) {
    const admin = await findOrCreate(
      em,
      Administrador,
      { email: 'admin.demo@clubnautico.test' },
      {
        nombre: 'Carla',
        apellido: 'Administradora',
        dni: '30123456',
        email: 'admin.demo@clubnautico.test',
        password: '30123456',
      },
    );
    const socio1 = await findOrCreate(
      em,
      Socio,
      { email: 'lucas.demo@clubnautico.test' },
      {
        nombre: 'Lucas',
        apellido: 'Marin',
        dni: '35123456',
        email: 'lucas.demo@clubnautico.test',
        telefono: '3415550101',
        password: '35123456',
        activo: true,
      },
    );
    const socio2 = await findOrCreate(
      em,
      Socio,
      { email: 'sofia.demo@clubnautico.test' },
      {
        nombre: 'Sofia',
        apellido: 'Navegante',
        dni: '36234567',
        email: 'sofia.demo@clubnautico.test',
        telefono: '3415550102',
        password: '36234567',
        activo: true,
      },
    );
    const socio3 = await findOrCreate(
      em,
      Socio,
      { email: 'mateo.demo@clubnautico.test' },
      {
        nombre: 'Mateo',
        apellido: 'Bajamar',
        dni: '37345678',
        email: 'mateo.demo@clubnautico.test',
        telefono: '3415550103',
        password: '37345678',
        activo: true,
      },
    );
    return { admin, socio1, socio2, socio3 };
  }

  private async seedEmbarcaciones(
    em: EntityManager,
    tipos: Awaited<ReturnType<DemoSeeder['seedTipos']>>,
    usuarios: Awaited<ReturnType<DemoSeeder['seedUsuarios']>>,
  ) {
    const lanchaLucas = await findOrCreate(
      em,
      Embarcacion,
      { matricula: 'RE-100-LM' },
      {
        nombre: 'Brisa',
        matricula: 'RE-100-LM',
        eslora: 8.5,
        tipoEmbarcacion: tipos.lancha,
        socio: usuarios.socio1,
      },
    );
    const veleroSofia = await findOrCreate(
      em,
      Embarcacion,
      { matricula: 'RE-200-SN' },
      {
        nombre: 'Horizonte',
        matricula: 'RE-200-SN',
        eslora: 14,
        tipoEmbarcacion: tipos.velero,
        socio: usuarios.socio2,
      },
    );
    const kayakMateo = await findOrCreate(
      em,
      Embarcacion,
      { matricula: 'RE-300-MB' },
      {
        nombre: 'Delta',
        matricula: 'RE-300-MB',
        eslora: 4,
        tipoEmbarcacion: tipos.kayak,
        socio: usuarios.socio3,
      },
    );
    const embarcacionClub = await findOrCreate(
      em,
      Embarcacion,
      { matricula: 'CLUB-001' },
      {
        nombre: 'Nautilus',
        matricula: 'CLUB-001',
        eslora: 7,
        tipoEmbarcacion: tipos.lancha,
        socio: null,
      },
    );
    return { lanchaLucas, veleroSofia, kayakMateo, embarcacionClub };
  }

  private async seedAfiliaciones(
    em: EntityManager,
    usuarios: Awaited<ReturnType<DemoSeeder['seedUsuarios']>>,
  ) {
    const activaLucas = await findOrCreate(
      em,
      Afiliacion,
      { socio: usuarios.socio1, tipo: 'premium' },
      {
        socio: usuarios.socio1,
        tipo: 'premium',
        fechaInicio: dateAt(-180),
        fechaFin: undefined,
      },
    );
    const activaSofia = await findOrCreate(
      em,
      Afiliacion,
      { socio: usuarios.socio2, tipo: 'vip' },
      {
        socio: usuarios.socio2,
        tipo: 'vip',
        fechaInicio: dateAt(-120),
        fechaFin: undefined,
      },
    );
    const finalizadaMateo = await findOrCreate(
      em,
      Afiliacion,
      { socio: usuarios.socio3, tipo: 'basica' },
      {
        socio: usuarios.socio3,
        tipo: 'basica',
        fechaInicio: dateAt(-360),
        fechaFin: dateAt(-30),
      },
    );
    return { activaLucas, activaSofia, finalizadaMateo };
  }

  private async seedReservasInfraestructura(
    em: EntityManager,
    recursos: Awaited<ReturnType<DemoSeeder['seedRecursos']>>,
    usuarios: Awaited<ReturnType<DemoSeeder['seedUsuarios']>>,
    embarcaciones: Awaited<ReturnType<DemoSeeder['seedEmbarcaciones']>>,
  ) {
    const reservaAmarra = await findOrCreate(
      em,
      ReservaInfraestructura,
      { embarcacion: embarcaciones.lanchaLucas, amarra: recursos.amarra1 },
      {
        socio: usuarios.socio1,
        embarcacion: embarcaciones.lanchaLucas,
        amarra: recursos.amarra1,
        box: null,
        fechaInicio: dateAt(-90),
        fechaFin: null,
        estado: EstadoReservaInfraestructura.ACTIVA,
        precioMensualFinal: 115000,
      },
    );
    const reservaBox = await findOrCreate(
      em,
      ReservaInfraestructura,
      { embarcacion: embarcaciones.veleroSofia, box: recursos.box1 },
      {
        socio: usuarios.socio2,
        embarcacion: embarcaciones.veleroSofia,
        amarra: null,
        box: recursos.box1,
        fechaInicio: dateAt(-60),
        fechaFin: null,
        estado: EstadoReservaInfraestructura.ACTIVA,
        precioMensualFinal: 88000,
      },
    );
    const reservaFinalizada = await findOrCreate(
      em,
      ReservaInfraestructura,
      { embarcacion: embarcaciones.kayakMateo, box: recursos.box2 },
      {
        socio: usuarios.socio3,
        embarcacion: embarcaciones.kayakMateo,
        amarra: null,
        box: recursos.box2,
        fechaInicio: dateAt(-240),
        fechaFin: dateAt(-20),
        estado: EstadoReservaInfraestructura.FINALIZADA,
        precioMensualFinal: 60000,
      },
    );
    return { reservaAmarra, reservaBox, reservaFinalizada };
  }

  private async seedReservasClubYTravelLift(
    em: EntityManager,
    usuarios: Awaited<ReturnType<DemoSeeder['seedUsuarios']>>,
    embarcaciones: Awaited<ReturnType<DemoSeeder['seedEmbarcaciones']>>,
  ) {
    const reservaClubAnterior = await em.findOne(ReservaEmbarcacionClub, {
      socio: usuarios.socio1,
      embarcacion: embarcaciones.lanchaLucas,
    });
    if (reservaClubAnterior) {
      em.remove(reservaClubAnterior);
    }

    await findOrCreate(
      em,
      ReservaEmbarcacionClub,
      { socio: usuarios.socio1, embarcacion: embarcaciones.embarcacionClub },
      {
        socio: usuarios.socio1,
        embarcacion: embarcaciones.embarcacionClub,
        fechaInicio: dateAt(7, 9),
        fechaFin: dateAt(7, 13),
        estado: 'ACTIVA',
      },
    );
    await findOrCreate(
      em,
      ReservaEmbarcacionClub,
      { socio: usuarios.socio2, embarcacion: embarcaciones.veleroSofia },
      {
        socio: usuarios.socio2,
        embarcacion: embarcaciones.veleroSofia,
        fechaInicio: dateAt(-20, 10),
        fechaFin: dateAt(-20, 16),
        estado: 'FINALIZADA',
      },
    );
    await findOrCreate(
      em,
      ReservaTravelLift,
      { socio: usuarios.socio1, embarcacion: embarcaciones.lanchaLucas },
      {
        socio: usuarios.socio1,
        embarcacion: embarcaciones.lanchaLucas,
        fechaHoraInicio: dateAt(14, 8),
        fechaHoraFin: dateAt(14, 10),
        estado: EstadoReservaTravelLift.ACTIVA,
      },
    );
    await findOrCreate(
      em,
      ReservaTravelLift,
      { socio: usuarios.socio3, embarcacion: embarcaciones.kayakMateo },
      {
        socio: usuarios.socio3,
        embarcacion: embarcaciones.kayakMateo,
        fechaHoraInicio: dateAt(-45, 9),
        fechaHoraFin: dateAt(-45, 11),
        estado: EstadoReservaTravelLift.FINALIZADA,
      },
    );
  }

  private async seedCuotas(
    em: EntityManager,
    usuarios: Awaited<ReturnType<DemoSeeder['seedUsuarios']>>,
    reservas: Awaited<ReturnType<DemoSeeder['seedReservasInfraestructura']>>,
  ) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const cuotaLucas = await findOrCreate(
      em,
      CuotaMensual,
      { socio: usuarios.socio1, mes: currentMonth, anio: currentYear },
      {
        socio: usuarios.socio1,
        mes: currentMonth,
        anio: currentYear,
        fechaVencimiento: dateAt(10),
        monto: 215000,
        pagada: false,
        fechaPago: undefined,
        metodoPago: undefined,
      },
    );
    await this.ensureDetalle(
      em,
      cuotaLucas,
      'Cuota base del club',
      100000,
      null,
    );
    await this.ensureDetalle(
      em,
      cuotaLucas,
      'Amarra Nro 101',
      reservas.reservaAmarra.precioMensualFinal,
      reservas.reservaAmarra,
    );

    const cuotaSofia = await findOrCreate(
      em,
      CuotaMensual,
      { socio: usuarios.socio2, mes: previousMonth, anio: previousYear },
      {
        socio: usuarios.socio2,
        mes: previousMonth,
        anio: previousYear,
        fechaVencimiento: dateAt(-20),
        monto: 188000,
        pagada: true,
        fechaPago: dateAt(-25),
        metodoPago: MetodoPago.EFECTIVO,
      },
    );
    await this.ensureDetalle(
      em,
      cuotaSofia,
      'Cuota base del club',
      100000,
      null,
    );
    await this.ensureDetalle(
      em,
      cuotaSofia,
      'Box Nro B-01',
      reservas.reservaBox.precioMensualFinal,
      reservas.reservaBox,
    );

    const cuotaMateo = await findOrCreate(
      em,
      CuotaMensual,
      { socio: usuarios.socio3, mes: previousMonth, anio: previousYear },
      {
        socio: usuarios.socio3,
        mes: previousMonth,
        anio: previousYear,
        fechaVencimiento: dateAt(-20),
        monto: 100000,
        pagada: false,
        fechaPago: undefined,
        metodoPago: undefined,
      },
    );
    await this.ensureDetalle(
      em,
      cuotaMateo,
      'Cuota base del club',
      100000,
      null,
    );
  }

  private async ensureDetalle(
    em: EntityManager,
    cuota: CuotaMensual,
    concepto: string,
    monto: number,
    reservaInfraestructura: ReservaInfraestructura | null,
  ) {
    const existing = await em.findOne(DetalleCuota, {
      cuota,
      concepto,
    });
    if (existing) {
      em.assign(existing, {
        monto,
        reservaInfraestructura: reservaInfraestructura ?? undefined,
      });
      return;
    }

    em.persist(
      em.create(DetalleCuota, {
        cuota,
        concepto,
        monto,
        reservaInfraestructura: reservaInfraestructura ?? undefined,
      }),
    );
  }
}
