import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evento } from './evento.entity';
import { Usuario } from '../users/usuario.entity';
import { Evaluacion } from '../evaluations/evaluacion.entity';

@Entity('esq_jurados_evento')
export class JuradoEvento {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'evento_id', nullable: true })
    evento_id: string;

    @ManyToOne(() => Evento, evento => evento.jurados, { nullable: true })
    @JoinColumn({ name: 'evento_id' })
    evento: Evento;

    @Column({ name: 'usuario_id', nullable: true })
    usuario_id: string;

    @ManyToOne(() => Usuario, usuario => usuario.asignacionesJurado, { nullable: true })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @OneToMany(() => Evaluacion, evaluacion => evaluacion.jurado)
    evaluaciones: Evaluacion[];
}
