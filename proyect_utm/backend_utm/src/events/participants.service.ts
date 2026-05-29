import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion } from './inscripcion.entity';

@Injectable()
export class ParticipantsService {
    constructor(
        @InjectRepository(Inscripcion)
        private inscripcionesRepository: Repository<Inscripcion>,
    ) { }

    async create(createParticipantDto: any): Promise<Inscripcion> {
        const inscripcion = this.inscripcionesRepository.create(createParticipantDto);
        return this.inscripcionesRepository.save(inscripcion as any);
    }

    async findAllByEvent(eventId: string): Promise<Inscripcion[]> {
        return this.inscripcionesRepository.find({ where: { evento_id: eventId as any }, relations: ['integrantes'] });
    }

    async update(id: string, updateParticipantDto: any): Promise<Inscripcion | null> {
        await this.inscripcionesRepository.update(id, updateParticipantDto);
        return this.inscripcionesRepository.findOne({ where: { id } });
    }

    async remove(id: string): Promise<void> {
        await this.inscripcionesRepository.delete(id);
    }
}
