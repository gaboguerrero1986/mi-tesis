import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from '../events/evento.entity';
import { Evaluacion } from '../evaluations/evaluacion.entity';
import { Usuario } from '../users/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, Evaluacion, Usuario])],
  controllers: [StatsController],
  providers: [StatsService]
})
export class StatsModule { }
