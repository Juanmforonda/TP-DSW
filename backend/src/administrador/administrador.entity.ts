import { Entity, PrimaryKey, Property, BeforeCreate } from '@mikro-orm/core';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, Length, IsString, IsNumberString, IsOptional } from 'class-validator';


@Entity()
export class Administrador extends BaseEntity {
    @PrimaryKey()
    id?: number;


    @Property({ nullable: false })
    @IsString({ message: 'El nombre debe ser texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre!: string;


    @Property()
    @IsNumberString({}, { message: 'El DNI debe contener solo números' })
    @Length(7, 10, { message: 'El DNI debe tener entre 7 y 10 dígitos' })
    dni!: string;


    @Property()
    @IsString({ message: 'El apellido debe ser texto' })
    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    apellido!: string;


    @Property()
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    email!: string;


    // hidden: nunca se incluye en el JSON de las respuestas
    @Property({ hidden: true })
    @IsString()
    @Length(6, 100, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password!: string;


    @BeforeCreate()
    async hashPassword() {
        if (this.dni) {
            const rawPassword = this.dni.slice(-6);
            this.password = await bcrypt.hash(rawPassword, 10);
        }
    }
}