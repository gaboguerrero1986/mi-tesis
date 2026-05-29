import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Parametro } from './parametro.entity';

@Entity('esq_tabla_maestra')
export class TablaMaestra {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true, nullable: true })
    nombre_entidad: string;

    @OneToMany(() => Parametro, parametro => parametro.entidad)
    parametros: Parametro[];
}
