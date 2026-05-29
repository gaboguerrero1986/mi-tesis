import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('evaluations')
export class EvaluationsController {
    constructor(private readonly evaluationsService: EvaluationsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createEvaluationDto: any, @Request() req) { // Keeping 'any' for now to avoid validation errors if frontend sends extra fields, but validation pipe will check decoration
        return this.evaluationsService.create(createEvaluationDto, req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-evaluations')
    getMyEvaluations(@Request() req) {
        return this.evaluationsService.getEvaluatedEventIds(req.user.userId);
    }

    @Get()
    findAll(@Query('eventId') eventId: string) {
        return this.evaluationsService.findAll(eventId);
    }
}
