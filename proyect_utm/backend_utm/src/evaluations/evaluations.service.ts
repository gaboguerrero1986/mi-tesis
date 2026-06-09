import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluacion } from './evaluacion.entity';
import { DetalleEvaluacion } from './detalle-evaluacion.entity';
import { JuradoEvento } from '../events/jurado-evento.entity';

@Injectable()
export class EvaluationsService {
    constructor(
        @InjectRepository(Evaluacion)
        private evaluacionesRepository: Repository<Evaluacion>,
        @InjectRepository(DetalleEvaluacion)
        private detallesRepository: Repository<DetalleEvaluacion>,
        @InjectRepository(JuradoEvento)
        private juradoEventoRepository: Repository<JuradoEvento>,
    ) { }

    async create(createEvaluationDto: any, user: any): Promise<Evaluacion> {
        const payload: any = {};
        
        if (createEvaluationDto.eventId) {
            payload.evento_id = createEvaluationDto.eventId;
        }
        
        if (createEvaluationDto.participantId) {
            payload.inscripcion_id = createEvaluationDto.participantId;
        }

        if (createEvaluationDto.comentarios) {
            payload.comentarios = createEvaluationDto.comentarios;
        }

        if (createEvaluationDto.details && Array.isArray(createEvaluationDto.details)) {
            payload.detalles = createEvaluationDto.details.map((d: any) => ({
                metrica_id: d.metricId,
                puntaje_asignado: d.value
            }));
        }

        if (user && user.userId) {
            payload.usuario_id = user.userId;

            // Prevent double voting if it's a student evaluating the event directly (no participantId)
            if (createEvaluationDto.eventId && !createEvaluationDto.participantId) {
                const existing = await this.evaluacionesRepository.findOne({
                    where: { evento_id: createEvaluationDto.eventId, usuario_id: user.userId }
                });
                if (existing) {
                    throw new BadRequestException('Ya has evaluado este evento');
                }
            }

            // If it's a juror evaluating, we need to find their JuradoEvento ID
            if (createEvaluationDto.eventId && createEvaluationDto.participantId) {
                const juradoEvento = await this.juradoEventoRepository.findOne({
                    where: { 
                        evento_id: createEvaluationDto.eventId,
                        usuario_id: user.userId
                    }
                });
                if (juradoEvento) {
                    payload.jurado_id = juradoEvento.id;
                }
            }
        }

        const evaluacion = this.evaluacionesRepository.create(payload as any);
        return this.evaluacionesRepository.save(evaluacion as any);
    }

    async findAll(eventId: string): Promise<Evaluacion[]> {
        return this.evaluacionesRepository.find({ 
            where: { evento_id: eventId },
            relations: ['detalles', 'jurado', 'inscripcion'] 
        });
    }

    async getEvaluatedEventIds(userId: string): Promise<string[]> {
        const evaluations = await this.evaluacionesRepository.find({
            where: [
                { jurado: { usuario_id: userId } },
                { usuario_id: userId }
            ],
            relations: ['jurado'],
            select: ['evento_id']
        });
        const uniqueIds = new Set(evaluations.map(e => e.evento_id));
        return Array.from(uniqueIds);
    }
}
