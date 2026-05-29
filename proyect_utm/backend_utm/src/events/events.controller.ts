import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createEventDto: any, @Request() req) {
        return this.eventsService.create(createEventDto);
    }

    @Get()
    findAll(@Query('active') active?: string) {
        return this.eventsService.findAll(active === 'true');
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('assigned')
    findAssigned(@Request() req) {
        return this.eventsService.findAssigned(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('managed')
    findManaged(@Request() req) {
        return this.eventsService.findManaged(req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEventDto: any) {
        return this.eventsService.update(id, updateEventDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
