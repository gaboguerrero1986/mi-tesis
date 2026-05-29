import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evento } from './evento.entity';
import { Submetrica } from './submetrica.entity';

@Entity('esq_metricas')
export class Metrica {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'evento_id', nullable: true })
    evento_id: string;

    @ManyToOne(() => Evento, evento => evento.metricas, { nullable: true })
    @JoinColumn({ name: 'evento_id' })
    evento: Evento;

    @Column({ length: 100, nullable: true })
    nombre: string;

    @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
    peso_porcentual: number;

    @Column({ length: 20, default: 'jury' })
    rol_evaluador: string;

    @OneToMany(() => Submetrica, submetrica => submetrica.metrica)
    submetricas: Submetrica[];
}
