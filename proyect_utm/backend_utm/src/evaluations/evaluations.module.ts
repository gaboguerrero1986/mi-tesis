import { Module } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evaluacion } from './evaluacion.entity';
import { DetalleEvaluacion } from './detalle-evaluacion.entity';
import { JuradoEvento } from '../events/jurado-evento.entity';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Evaluacion, DetalleEvaluacion, JuradoEvento]),
        EventsModule
    ],
    controllers: [EvaluationsController],
    providers: [EvaluationsService],
    exports: [EvaluationsService],
})
export class EvaluationsModule { }
