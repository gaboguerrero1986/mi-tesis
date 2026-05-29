import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluacion } from '../evaluations/evaluacion.entity';
import { Inscripcion } from '../events/inscripcion.entity';
import { Evento } from '../events/evento.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Evaluacion, Inscripcion, Evento])],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule { }
