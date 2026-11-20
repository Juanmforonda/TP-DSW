import {
  DateTimeType,
  Entity,
  Enum,
  ManyToOne,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { Administrador } from '../administrador/administrador.entity.js';
import { CuotaMensual } from './cuotaMensual.entity.js';

export enum PagoAuditoriaFuente {
  MANUAL = 'manual',
  MERCADO_PAGO = 'mercado_pago',
}

@Entity()
export class PagoAuditoria {
  @PrimaryKey()
  id!: number;

  @Property({ type: DateTimeType })
  fecha = new Date();

  @Property({ type: 'boolean' })
  estadoAnterior!: boolean;

  @Property({ type: 'boolean' })
  estadoNuevo!: boolean;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  importe!: number;

  @Property()
  moneda!: string;

  @Enum({ items: () => PagoAuditoriaFuente })
  fuente!: PagoAuditoriaFuente;

  @Property({ nullable: true })
  paymentId?: string;

  @Property({ nullable: true, type: 'text' })
  motivo?: string;

  @ManyToOne(() => CuotaMensual)
  cuota!: Rel<CuotaMensual>;

  @ManyToOne(() => Administrador, { nullable: true })
  administrador?: Rel<Administrador>;
}
