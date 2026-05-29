import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metrica } from '../events/metrica.entity';
import { Submetrica } from '../events/submetrica.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Metrica, Submetrica])],
    controllers: [MetricsController],
    providers: [MetricsService],
    exports: [MetricsService],
})
export class MetricsModule { }
