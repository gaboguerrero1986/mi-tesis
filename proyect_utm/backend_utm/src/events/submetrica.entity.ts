import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Metrica } from './metrica.entity';

@Entity('esq_submetricas')
export class Submetrica {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'metrica_id', nullable: true })
    metrica_id: number;

    @ManyToOne(() => Metrica, metrica => metrica.submetricas, { nullable: true })
    @JoinColumn({ name: 'metrica_id' })
    metrica: Metrica;

    @Column({ length: 150, nullable: true })
    nombre: string;
}
