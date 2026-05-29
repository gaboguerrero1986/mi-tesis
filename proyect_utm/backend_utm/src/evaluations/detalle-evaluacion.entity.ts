import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Evaluacion } from './evaluacion.entity';
import { Metrica } from '../events/metrica.entity';

@Entity('esq_detalles_evaluacion')
export class DetalleEvaluacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'evaluacion_id', nullable: true })
    evaluacion_id: string;

    @ManyToOne(() => Evaluacion, evaluacion => evaluacion.detalles, { nullable: true })
    @JoinColumn({ name: 'evaluacion_id' })
    evaluacion: Evaluacion;

    @Column({ name: 'metrica_id', nullable: true })
    metrica_id: number;

    @ManyToOne(() => Metrica, { nullable: true })
    @JoinColumn({ name: 'metrica_id' })
    metrica: Metrica;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    puntaje_asignado: number;
}
