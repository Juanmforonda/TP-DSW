import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection } from '@mikro-orm/core';
import { IsNotEmpty, IsString, IsNumber, IsEnum} from 'class-validator';
import { ReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
export enum Estado {
  LIBRE = 'libre',
  OCUPADO = 'ocupado',
  MANTENIMIENTO = 'mantenimiento',
}

@Entity()
export class Amarra {
    @PrimaryKey()
    id?: number;

    @Enum(() => Estado)
    @IsEnum(Estado, { message: 'El estado debe ser: libre, ocupado o mantenimiento' })
    @IsNotEmpty({ message: 'El estado es obligatorio' })
    estado!: Estado;

    @Property()
    @IsNumber({}, { message: 'El precio mensual debe ser un número' })
    precioMensualBase!: number;

    @Property()
    @IsNumber({}, { message: 'La longitud máxima debe ser un número' })
    longitudMax!: number;

    @Property()
    @IsString({ message: 'La zona debe ser texto' })
    @IsNotEmpty({ message: 'La zona es obligatoria' })
    zona!: string;

    @Property()
    @IsNumber({}, { message: 'El número de pilón debe ser un número' })
    nroPilon!: number;

    @OneToMany(() => ReservaInfraestructura, (reserva) => reserva.amarra)
    reservasInfraestructura = new Collection<ReservaInfraestructura>(this);
}