import {Entity, Property, ManyToOne, Rel, DateTimeType, Cascade, Collection, Enum, OneToMany, Unique} from '@mikro-orm/core';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, Max, Min } from 'class-validator';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { DetalleCuota } from '../detalleCuota/detalleCuota.entity.js';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  MERCADO_PAGO = 'mercado_pago',
}

@Entity()
@Unique({ properties: ['socio', 'mes', 'anio'] })
export class CuotaMensual extends BaseEntity {
  @Property({ type: DateTimeType, nullable: false })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de vencimiento debe ser una fecha valida' })
  fechaVencimiento!: Date;

  @Property({ nullable: false })
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  mes!: number;

  @Property({ nullable: false })
  @IsInt({ message: 'El año debe ser un numero entero' })
  anio!: number;

  @Property({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Property({ type: 'boolean', default: false })
  pagada: boolean = false;

  @Property({ nullable: true })
  @Type(() => Date)
  @IsOptional()
  @IsDate({ message: 'La fecha de pago debe ser una fecha válida' })
  fechaPago?: Date;

  @Enum({ items: () => MetodoPago, nullable: true })
  metodoPago?: MetodoPago;

  @ManyToOne(() => Socio, { nullable: false })
  socio!: Rel<Socio>;

  @OneToMany(() => DetalleCuota, (d) => d.cuota, { cascade: [Cascade.ALL] })
  detalles = new Collection<DetalleCuota>(this);
}