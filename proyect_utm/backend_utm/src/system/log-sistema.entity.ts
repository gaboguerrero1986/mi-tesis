import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../users/usuario.entity';

@Entity('esq_logs_sistema')
export class LogSistema {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: string;

    @Column({ name: 'usuario_id', nullable: true })
    usuario_id: string;

    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column({ length: 100, nullable: true })
    accion: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;
}
