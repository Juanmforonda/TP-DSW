import { Entity, PrimaryKey, Property, OneToMany  } from '@mikro-orm/core';

export type Estado = 'libre' | 'ocupado'

@Entity()
export class Amarra{
    @PrimaryKey()
    id?: number
    
    @Property()
    estado!: Estado

    @Property()
    precioMensualBase!: number

    @Property()
    longitudMax!: number

    @Property()
    zona!: string

    @Property()
    nroPilon!: number


    

}