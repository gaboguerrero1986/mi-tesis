import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TablaMaestra } from './tabla-maestra.entity';
import { EjecucionParametro } from './ejecucion-parametro.entity';

@Entity('esq_parametros')
export class Parametro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'entidad_id', nullable: true })
    entidad_id: number;

    @ManyToOne(() => TablaMaestra, tm => tm.parametros, { nullable: true })
    @JoinColumn({ name: 'entidad_id' })
    entidad: TablaMaestra;

    @Column({ generated: 'increment' })
    codigo_parametro: number;

    @Column({ length: 150, nullable: true })
    descripcion: string;

    @Column({ length: 20, nullable: true })
    tipo_dato: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @OneToMany(() => EjecucionParametro, ep => ep.parametro)
    ejecuciones: EjecucionParametro[];
}
