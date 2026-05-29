import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Facultad } from './facultad.entity';
import { Persona } from '../users/persona.entity';

@Entity('esq_carreras')
export class Carrera {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'facultad_id', nullable: true })
    facultad_id: number;

    @ManyToOne(() => Facultad, facultad => facultad.carreras, { nullable: true })
    @JoinColumn({ name: 'facultad_id' })
    facultad: Facultad;

    @Column({ length: 150 })
    nombre: string;

    @OneToMany(() => Persona, persona => persona.carrera)
    personas: Persona[];
}
