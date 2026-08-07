import {
  Entity,
  Property,
  OneToMany,
  Collection,
  BeforeCreate,
} from '@mikro-orm/core';
import { Embarcacion } from '../embarcacion/embarcacion.entity.js';
import { Afiliacion } from '../afiliacion/afiliacion.entity.js';
import { CuotaMensual } from '../cuotaMensual/cuotaMensual.entity.js';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import bcrypt from 'bcrypt';
import { ReservaEmbarcacionClub } from '../reservaEmbarcacionClub/reservaEmbarcacionClub.entity.js';
import { ReservaInfraestructura } from '../reservaInfraestructura/reservaInfraestructura.entity.js';
import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsString,
  IsNumberString,
  IsOptional,
} from 'class-validator';
@Entity()
export class Socio extends BaseEntity {
  @Property()
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @Property()
  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido!: string;

  @Property()
  @IsNumberString({}, { message: 'El DNI debe contener solo números' })
  @Length(7, 10, { message: 'El DNI debe tener entre 7 y 10 dígitos' })
  dni!: string;

  @Property()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email!: string;

  @Property()
  @IsNumberString({}, { message: 'El teléfono debe contener solo números' })
  @Length(8, 15, { message: 'El teléfono debe tener entre 8 y 15 dígitos' })
  telefono!: string;

  @Property()
  @IsOptional()
  @IsString()
  @Length(6, 100, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @OneToMany(() => Embarcacion, (embarcacion) => embarcacion.socio)
  embarcaciones = new Collection<Embarcacion>(this);

  @OneToMany(() => Afiliacion, (afiliacion) => afiliacion.socio)
  afiliaciones = new Collection<Afiliacion>(this);

  @OneToMany(() => CuotaMensual, (cuotaMensual) => cuotaMensual.socio)
  cuotasMensuales = new Collection<CuotaMensual>(this);

  @OneToMany(() => ReservaEmbarcacionClub, (reserva) => reserva.socio)
  reservasEmbarcacion = new Collection<ReservaEmbarcacionClub>(this);

  @OneToMany(() => ReservaInfraestructura, (reserva) => reserva.socio)
  reservasInfraestructura = new Collection<ReservaInfraestructura>(this);

  @BeforeCreate()
  async hashPassword() {
    if (this.dni) {
      const rawPassword = this.dni.slice(-6);
      this.password = await bcrypt.hash(rawPassword, 10);
    }
  }
  get activo(): boolean {
    return this.afiliaciones.getItems().some(
      (afiliacion) => !afiliacion.fechaFin,
    );
  }
}
