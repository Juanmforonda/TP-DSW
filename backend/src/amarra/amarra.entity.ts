import { Entity, PrimaryKey, Property, OneToOne, Enum, Rel } from '@mikro-orm/core';
import { IsNotEmpty, IsString, IsNumber, IsEnum} from 'class-validator';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
export enum Estado {
  LIBRE = 'libre',
  OCUPADO = 'ocupado'
}

@Entity()
export class Amarra {
    @PrimaryKey()
    id?: number;

    @Enum(() => Estado)
    @IsEnum(Estado, { message: 'El estado debe ser: libre u ocupado' })
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

    // Lado inverso de la relación 1:1. La FK real vive en Embarcacion (embarcacion.amarra).
    // No hay columna acá; MikroORM resuelve esto con una query cuando se popula.
    @OneToOne(() => Embarcacion, (embarcacion) => embarcacion.amarra)
    embarcacion?: Rel<Embarcacion> | null;
}