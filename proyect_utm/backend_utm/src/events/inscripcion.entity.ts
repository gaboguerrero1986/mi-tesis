import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evento } from './evento.entity';
import { IntegranteInscripcion } from './integrante-inscripcion.entity';
import { Evaluacion } from '../evaluations/evaluacion.entity';

@Entity('esq_inscripciones')
export class Inscripcion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'evento_id', nullable: true })
    evento_id: string;

    @ManyToOne(() => Evento, evento => evento.inscripciones, { nullable: true })
    @JoinColumn({ name: 'evento_id' })
    evento: Evento;

    @Column({ length: 20, default: 'individual' })
    tipo_inscripcion: string;

    @Column({ length: 150, nullable: true })
    nombre_equipo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @OneToMany(() => IntegranteInscripcion, integrante => integrante.inscripcion, { cascade: true })
    integrantes: IntegranteInscripcion[];

    @OneToMany(() => Evaluacion, evaluacion => evaluacion.inscripcion)
    evaluaciones: Evaluacion[];
}
