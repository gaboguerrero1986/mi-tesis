import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EavService } from './eav.service';
import { EavController } from './eav.controller';
import { TablaMaestra } from './tabla-maestra.entity';
import { Parametro } from './parametro.entity';
import { EjecucionParametro } from './ejecucion-parametro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TablaMaestra, Parametro, EjecucionParametro])],
  providers: [EavService],
  controllers: [EavController],
  exports: [EavService]
})
export class EavModule {}
