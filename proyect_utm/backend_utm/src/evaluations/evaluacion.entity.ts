import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { JuradoEvento } from '../events/jurado-evento.entity';
import { Inscripcion } from '../events/inscripcion.entity';
import { DetalleEvaluacion } from './detalle-evaluacion.entity';

@Entity('esq_evaluaciones')
export class Evaluacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'evento_id', nullable: true })
    evento_id: string;


    @Column({ name: 'jurado_id', nullable: true })
    jurado_id: string;

    @ManyToOne(() => JuradoEvento, jurado => jurado.evaluaciones, { nullable: true })
    @JoinColumn({ name: 'jurado_id' })
    jurado: JuradoEvento;

    @Column({ name: 'inscripcion_id', nullable: true })
    inscripcion_id: string;

    @ManyToOne(() => Inscripcion, inscripcion => inscripcion.evaluaciones, { nullable: true })
    @JoinColumn({ name: 'inscripcion_id' })
    inscripcion: Inscripcion;

    @OneToMany(() => DetalleEvaluacion, detalle => detalle.evaluacion, { cascade: true })
    detalles: DetalleEvaluacion[];
}
