import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Metrica } from '../events/metrica.entity';

@Injectable()
export class MetricsService {
    constructor(
        @InjectRepository(Metrica)
        private metricasRepository: Repository<Metrica>,
    ) { }

    async create(createMetricDto: any): Promise<Metrica> {
        const metrica = this.metricasRepository.create(createMetricDto);
        return this.metricasRepository.save(metrica as any);
    }

    async findAllByEvent(eventId: string): Promise<Metrica[]> {
        return this.metricasRepository.find({ where: { evento_id: eventId as any }, relations: ['submetricas'] });
    }

    async findGlobals(role?: string): Promise<Metrica[]> {
        return this.metricasRepository.find({ where: { evento_id: IsNull() as any }, relations: ['submetricas'] });
    }

    async update(id: number, updateMetricDto: any): Promise<Metrica | null> {
        await this.metricasRepository.update(id, updateMetricDto);
        return this.metricasRepository.findOne({ where: { id } });
    }

    async remove(id: number): Promise<void> {
        await this.metricasRepository.delete(id);
    }
}
