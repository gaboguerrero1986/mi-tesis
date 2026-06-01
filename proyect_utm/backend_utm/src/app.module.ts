import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { MetricsModule } from './metrics/metrics.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ReportsModule } from './reports/reports.module';
import { StatsModule } from './stats/stats.module';
import { EavModule } from './eav/eav.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('🔌 DB Config:', {
          host: configService.get<string>('DB_HOST'),
          database: configService.get<string>('DB_NAME'),
          username: configService.get<string>('DB_USERNAME')
        });
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          ssl: (configService.get<string>('DB_HOST') || '').includes('localhost') ? false : { rejectUnauthorized: false },
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false, // Auto-create tables (dev only)
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    MetricsModule,
    EvaluationsModule,
    ReportsModule,
    StatsModule,
    EavModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
