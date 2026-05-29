import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Carrera } from '../academics/carrera.entity';
import { Usuario } from './usuario.entity';
import { IntegranteInscripcion } from '../events/integrante-inscripcion.entity';

@Entity('esq_personas')
export class Persona {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    nombres: string;

    @Column({ length: 100 })
    apellidos: string;

    @Column({ length: 20, unique: true, nullable: true })
    identificacion: string;

    @Column({ name: 'carrera_id', nullable: true })
    carrera_id: number;

    @ManyToOne(() => Carrera, carrera => carrera.personas, { nullable: true })
    @JoinColumn({ name: 'carrera_id' })
    carrera: Carrera;

    @OneToOne(() => Usuario, usuario => usuario.persona)
    usuario: Usuario;

    @OneToMany(() => IntegranteInscripcion, integrante => integrante.persona)
    integracionesInscripcion: IntegranteInscripcion[];
}
