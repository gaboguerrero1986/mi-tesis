import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Carrera } from './carrera.entity';

@Entity('esq_facultades')
export class Facultad {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 150 })
    nombre: string;

    @OneToMany(() => Carrera, carrera => carrera.facultad)
    carreras: Carrera[];
}
