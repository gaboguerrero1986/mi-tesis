import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Parametro } from './parametro.entity';

@Entity('esq_ejecucion_parametros')
export class EjecucionParametro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'parametro_id', nullable: true })
    parametro_id: number;

    @ManyToOne(() => Parametro, p => p.ejecuciones, { nullable: true })
    @JoinColumn({ name: 'parametro_id' })
    parametro: Parametro;

    @Column({ type: 'uuid' })
    registro_id: string;

    @Column({ type: 'text', nullable: true })
    valor_texto: string;

    @Column({ type: 'numeric', nullable: true })
    valor_numerico: number;
}
