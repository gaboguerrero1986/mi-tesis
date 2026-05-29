import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento } from '../events/evento.entity';
import { Evaluacion } from '../evaluations/evaluacion.entity';
import { Usuario } from '../users/usuario.entity';

@Injectable()
export class StatsService {
    constructor(
        @InjectRepository(Evento)
        private eventsRepository: Repository<Evento>,
        @InjectRepository(Evaluacion)
        private evaluationsRepository: Repository<Evaluacion>,
        @InjectRepository(Usuario)
        private usersRepository: Repository<Usuario>
    ) { }

    async getDashboardStats(): Promise<any> {
        return {
            activeEvents: await this.eventsRepository.count({ where: { estado: 'publicado' } }),
            totalJuries: await this.usersRepository.count({ where: { rol_sistema: 'jury' } }),
            totalEvaluations: await this.evaluationsRepository.count()
        };
    }
}
