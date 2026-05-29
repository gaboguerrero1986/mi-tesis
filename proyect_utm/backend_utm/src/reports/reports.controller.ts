import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get(':eventId')
    getReport(@Param('eventId') eventId: string) {
        return this.reportsService.getReport(eventId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':eventId/winners')
    getWinners(@Param('eventId') eventId: string) {
        return this.reportsService.getEventRanking(eventId);
    }
}
