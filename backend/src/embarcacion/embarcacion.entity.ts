
import { Entity, Property, ManyToOne, Cascade, Rel, OneToMany, Collection } from '@mikro-orm/core';

import { Type } from 'class-transformer';
import { TipoEmbarcacion } from '../tipoEmbarcacion/tipoEmbarcacion.entity.js';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import { Socio } from '../socio/socio.entity.js';
import { ReservaEmbarcacionClub } from '../reservaEmbarcacionClub/reservaEmbarcacionClub.entity.js';
import { ReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import { IsNotEmpty, IsString, IsNumber, Min, Max, IsPositive, Length, IsDate, IsOptional } from 'class-validator';


@Entity()
export class Embarcacion extends BaseEntity {
  @Property({ nullable: false })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre!: string;

  @Property({ nullable: false })
  @IsString({ message: 'La matrícula debe ser texto' })
  @IsNotEmpty({ message: 'La matrícula es obligatoria' })
  @Length(3, 20, { message: 'La matrícula debe tener entre 3 y 20 caracteres' })
  matricula!: string;

  @Property({ nullable: false })
  @IsNumber({}, { message: 'La eslora debe ser un número' })
  @IsPositive({ message: 'La eslora debe ser un valor positivo' })
  @Min(1, { message: 'La eslora mínima es 1 metro' })
  @Max(100, { message: 'La eslora máxima es 100 metros' })
  eslora!: number;

  @ManyToOne(() => TipoEmbarcacion, { nullable: false })
  @IsNotEmpty({ message: 'El tipo de embarcación es obligatorio' })
  tipoEmbarcacion!: TipoEmbarcacion;

  @OneToMany(() => ReservaEmbarcacionClub, (reserva) => reserva.embarcacion, {
    cascade: [Cascade.ALL],
  })
  reservasEmbarcacionClub = new Collection<ReservaEmbarcacionClub>(this);

  @ManyToOne(() => Socio, { nullable: true })
  socio!: Rel<Socio>;

  @OneToMany(() => ReservaInfraestructura, (reserva) => reserva.embarcacion, {
    cascade: [Cascade.ALL],
  })
  reservasInfraestructura = new Collection<ReservaInfraestructura>(this);

  @Property({ nullable: true }) // Cuando es null significa que la afiliacion esta activa
  @Type(() => Date)
  @IsOptional()
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin?: Date;
}
