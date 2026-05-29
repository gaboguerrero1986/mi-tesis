import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Persona } from '../users/persona.entity';

@Entity('esq_integrantes_inscripcion')
export class IntegranteInscripcion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'inscripcion_id', nullable: true })
    inscripcion_id: string;

    @ManyToOne(() => Inscripcion, inscripcion => inscripcion.integrantes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'inscripcion_id' })
    inscripcion: Inscripcion;

    @Column({ name: 'persona_id', nullable: true })
    persona_id: string;

    @ManyToOne(() => Persona, persona => persona.integracionesInscripcion, { onDelete: 'CASCADE', cascade: true })
    @JoinColumn({ name: 'persona_id' })
    persona: Persona;
}
