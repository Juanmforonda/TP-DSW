import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import { CuotaMensual } from '../cuotaMensual/cuotaMensual.entity.js';
import { ReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';

@Entity()
export class DetalleCuota extends BaseEntity {
  @Property({ nullable: false })
  @IsString({ message: 'El concepto debe ser texto' })
  @IsNotEmpty({ message: 'El concepto es obligatorio' })
  concepto!: string; // ej: "Cuota base del club", "Amarra Nro 12"

  @Property({ nullable: false, type: 'decimal', precision: 10, scale: 2 })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  monto!: number;

  @ManyToOne(() => CuotaMensual, { nullable: false })
  cuota!: Rel<CuotaMensual>;

  @ManyToOne(() => ReservaInfraestructura, { nullable: true })
  reservaInfraestructura?: Rel<ReservaInfraestructura>;
}
