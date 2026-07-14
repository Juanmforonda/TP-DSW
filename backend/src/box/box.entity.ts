import { BaseEntity } from '../shared/baseEntity.entity.js';
import { Entity, PrimaryKey, Property, OneToOne, Enum, Rel } from '@mikro-orm/core';
import { IsNotEmpty, IsNumber, IsPositive, Min, IsEnum } from 'class-validator';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';

export enum Estado {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  MANTENIMIENTO = 'mantenimiento'
}

@Entity()
export class Box extends BaseEntity {

  @PrimaryKey()
  id?: number;
      
  @Enum(() => Estado)
  @IsEnum(Estado, { message: 'El estado debe ser: disponible, ocupado o mantenimiento' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  estado!: Estado;

  @Property()
  @IsNotEmpty({ message: 'El número de box es obligatorio' })
  nroBox!: string;

  @Property()
  @IsNumber({}, { message: 'El precio mensual debe ser un número' })
  @IsPositive({ message: 'El precio mensual debe ser positivo' })
  @Min(0, { message: 'El precio mensual no puede ser negativo' })
  precioMensualBase!: number;

  @OneToOne(() => Embarcacion, (embarcacion) => embarcacion.box)
  embarcacion?: Rel<Embarcacion> | null;
}