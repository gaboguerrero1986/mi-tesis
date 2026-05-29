import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Persona } from './persona.entity';
import { JuradoEvento } from '../events/jurado-evento.entity';

@Entity('esq_usuarios')
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'persona_id' })
    persona_id: string;

    @OneToOne(() => Persona, persona => persona.usuario, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'persona_id' })
    persona: Persona;

    @Column({ length: 50, unique: true })
    usuario: string;

    @Column({ length: 150, unique: true, nullable: true })
    correo: string;

    @Column({ length: 255, nullable: true })
    password_hash: string;

    @Column({ length: 20, nullable: true })
    rol_sistema: string;

    @OneToMany(() => JuradoEvento, jurado => jurado.usuario)
    asignacionesJurado: JuradoEvento[];
}
