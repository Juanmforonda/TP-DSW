import { Entity, ManyToOne, Property, Rel, Enum } from '@mikro-orm/core';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { Amarra } from '../amarra/amarra.entity.js';
import { Box } from '../box/box.entity.js';
import { IsNotEmpty, IsNumber, IsPositive, IsEnum } from 'class-validator';

export enum EstadoReservaInfraestructura {
  ACTIVA = 'ACTIVA',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

@Entity()
export class ReservaInfraestructura extends BaseEntity {
  @Property({ nullable: false })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio!: Date;

  @Property({ nullable: true })
  fechaFin?: Date | null;

  @Enum(() => EstadoReservaInfraestructura)
  @IsEnum(EstadoReservaInfraestructura, {
    message: 'El estado debe ser ACTIVA, FINALIZADA o CANCELADA',
  })
  estado: EstadoReservaInfraestructura = EstadoReservaInfraestructura.ACTIVA;

  @Property({ nullable: false })
  @IsNumber({}, { message: 'El precio mensual final debe ser un número' })
  @IsPositive({ message: 'El precio mensual final debe ser positivo' })
  precioMensualFinal!: number;

  @ManyToOne(() => Socio, { nullable: true })
  socio?: Rel<Socio> | null;

  @ManyToOne(() => Embarcacion, { nullable: false })
  embarcacion!: Rel<Embarcacion>;

  @ManyToOne(() => Amarra, { nullable: true })
  amarra?: Rel<Amarra> | null;

  @ManyToOne(() => Box, { nullable: true })
  box?: Rel<Box> | null;
}

