import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './evento.entity';
import { Inscripcion } from './inscripcion.entity';
import { IntegranteInscripcion } from './integrante-inscripcion.entity';
import { JuradoEvento } from './jurado-evento.entity';
import { Metrica } from './metrica.entity';
import { Submetrica } from './submetrica.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Evento, Inscripcion, IntegranteInscripcion, JuradoEvento, Metrica, Submetrica])],
    controllers: [EventsController, ParticipantsController],
    providers: [EventsService, ParticipantsService],
    exports: [EventsService, ParticipantsService],
})
export class EventsModule { }
