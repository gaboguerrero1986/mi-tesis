import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';
import { Metrica } from './metrica.entity';
import { JuradoEvento } from './jurado-evento.entity';
import { Usuario } from '../users/usuario.entity';

@Entity('esq_eventos')
export class Evento {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200, nullable: true })
    titulo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ length: 20, nullable: true })
    estado: string;

    @Column({ type: 'timestamp', nullable: true })
    fecha_inicio: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_fin: Date;

    @Column({ length: 50, default: 'individual' })
    modalidad_evaluacion: string;

    @Column({ name: 'responsable_id', nullable: true })
    responsable_id: string;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'responsable_id' })
    responsable: Usuario;

    @OneToMany(() => Inscripcion, inscripcion => inscripcion.evento, { cascade: true })
    inscripciones: Inscripcion[];

    @OneToMany(() => Metrica, metrica => metrica.evento, { cascade: true })
    metricas: Metrica[];

    @OneToMany(() => JuradoEvento, jurado => jurado.evento, { cascade: true })
    jurados: JuradoEvento[];

    @DeleteDateColumn({ name: 'eliminado_at', nullable: true })
    eliminado_at: Date;
}
