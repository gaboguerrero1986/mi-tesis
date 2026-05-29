import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Evento } from './evento.entity';

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);

    constructor(
        @InjectRepository(Evento)
        private eventsRepository: Repository<Evento>,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleEventFinalization() {
        const currentDate = new Date();
        const expiredEvents = await this.eventsRepository.find({
            where: {
                estado: 'publicado',
                fecha_fin: LessThan(currentDate),
            },
        });

        if (expiredEvents.length > 0) {
            for (const event of expiredEvents) {
                event.estado = 'finalizado';
                await this.eventsRepository.save(event);
                this.logger.log(`Evento finalizado automáticamente: ${event.id} - ${event.titulo}`);
            }
        }
    }

    async create(createEventDto: Partial<Evento>): Promise<Evento> {
        const event = this.eventsRepository.create(createEventDto);
        const savedEvent = await this.eventsRepository.save(event);

        // Fix orphaned Integrantes (TypeORM deep cascade bug)
        if (savedEvent.inscripciones) {
            for (const insc of savedEvent.inscripciones) {
                if (insc.integrantes && insc.id) {
                    for (const int of insc.integrantes) {
                        if (int.id) {
                            await this.eventsRepository.manager.query(
                                `UPDATE esq_integrantes_inscripcion SET inscripcion_id = $1 WHERE id = $2`,
                                [insc.id, int.id]
                            );
                        }
                    }
                }
            }
        }
        return this.findOne(savedEvent.id) as any;
    }

    async findAll(activeOnly: boolean = false): Promise<Evento[]> {
        const query = this.eventsRepository.createQueryBuilder('evento')
            .leftJoinAndSelect('evento.metricas', 'metricas')
            .leftJoinAndSelect('evento.inscripciones', 'inscripciones')
            .leftJoinAndSelect('inscripciones.integrantes', 'integrantes')
            .leftJoinAndSelect('integrantes.persona', 'persona_integrante')
            .leftJoinAndSelect('evento.jurados', 'jurados')
            .leftJoinAndSelect('jurados.usuario', 'usuario')
            .leftJoinAndSelect('usuario.persona', 'persona');

        if (activeOnly) {
            query.where('evento.estado = :status', { status: 'publicado' });
        }
        return query.getMany();
    }

    async findAssigned(userId: string): Promise<Evento[]> {
        return this.eventsRepository.createQueryBuilder('evento')
            .leftJoinAndSelect('evento.metricas', 'metricas')
            .leftJoinAndSelect('evento.inscripciones', 'inscripciones')
            .leftJoinAndSelect('inscripciones.integrantes', 'integrantes')
            .leftJoinAndSelect('integrantes.persona', 'persona_integrante')
            .innerJoin('evento.jurados', 'jurados', 'jurados.usuario_id = :userId', { userId })
            .where('evento.estado = :status', { status: 'publicado' })
            .getMany();
    }

    async findManaged(userId: string): Promise<Evento[]> {
        return this.eventsRepository.createQueryBuilder('evento')
            .leftJoinAndSelect('evento.metricas', 'metricas')
            .leftJoinAndSelect('evento.inscripciones', 'inscripciones')
            .leftJoinAndSelect('inscripciones.integrantes', 'integrantes')
            .leftJoinAndSelect('integrantes.persona', 'persona_integrante')
            .leftJoinAndSelect('evento.jurados', 'jurados')
            .leftJoinAndSelect('jurados.usuario', 'usuario')
            .leftJoinAndSelect('usuario.persona', 'persona')
            .where('evento.responsable_id = :userId', { userId })
            .getMany();
    }

    async findOne(id: string): Promise<Evento | null> {
        return this.eventsRepository.findOne({
            where: { id },
            relations: ['metricas', 'metricas.submetricas', 'inscripciones', 'inscripciones.integrantes', 'inscripciones.integrantes.persona', 'jurados', 'jurados.usuario', 'jurados.usuario.persona']
        });
    }

    async update(id: string, updateEventDto: Partial<Evento>): Promise<Evento | null> {
        const event = await this.findOne(id);
        if (!event) return null;

        // Ensure deep relations are assigned correctly for cascade saves
        if (updateEventDto.inscripciones) {
            event.inscripciones = updateEventDto.inscripciones as any;
        }
        if (updateEventDto.metricas) {
            event.metricas = updateEventDto.metricas as any;
        }
        if (updateEventDto.jurados) {
            event.jurados = updateEventDto.jurados as any;
        }

        try {
            Object.assign(event, updateEventDto);
            const savedEvent = await this.eventsRepository.save(event);

            // Fix orphaned Integrantes (TypeORM deep cascade bug)
            if (savedEvent.inscripciones) {
                for (const insc of savedEvent.inscripciones) {
                    if (insc.integrantes && insc.id) {
                        for (const int of insc.integrantes) {
                            if (int.id) {
                                await this.eventsRepository.manager.query(
                                    `UPDATE esq_integrantes_inscripcion SET inscripcion_id = $1 WHERE id = $2`,
                                    [insc.id, int.id]
                                );
                            }
                        }
                    }
                }
            }

            return this.findOne(id);
        } catch (error) {
            console.error('ERROR SAVING EVENT:', error);
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        // Soft delete implementation: sets eliminado_at to current timestamp
        await this.eventsRepository.softDelete(id);
    }
}
