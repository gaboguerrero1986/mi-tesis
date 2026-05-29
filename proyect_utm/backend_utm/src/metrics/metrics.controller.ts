import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Patch } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createMetricDto: any) {
        return this.metricsService.create(createMetricDto);
    }

    @Get()
    findAll(@Query('eventId') eventId: string) {
        return this.metricsService.findAllByEvent(eventId);
    }

    @Get('global')
    findGlobal() {
        return this.metricsService.findGlobals();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('global/:id')
    updateGlobal(@Param('id') id: string, @Body() updateMetricDto: any) {
        return this.metricsService.update(+id, updateMetricDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.metricsService.remove(+id);
    }
}
