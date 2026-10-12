import { Entity, Enum, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { Socio } from '../socio/socio.entity.js';

export enum EstadoReservaTravelLift {
  ACTIVA = 'ACTIVA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

@Entity()
export class ReservaTravelLift extends BaseEntity {
  @Property({ nullable: false })
  fechaHoraInicio!: Date;

  @Property({ nullable: false })
  fechaHoraFin!: Date;

  @Enum(() => EstadoReservaTravelLift)
  estado: EstadoReservaTravelLift = EstadoReservaTravelLift.ACTIVA;

  @ManyToOne(() => Socio, { nullable: false })
  socio!: Rel<Socio>;

  @ManyToOne(() => Embarcacion, { nullable: false })
  embarcacion!: Rel<Embarcacion>;
}
