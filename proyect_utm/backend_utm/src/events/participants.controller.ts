import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('events/:eventId/participants')
export class ParticipantsController {
    constructor(private readonly participantsService: ParticipantsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Param('eventId') eventId: string, @Body() createParticipantDto: any) {
        return this.participantsService.create({ ...createParticipantDto, evento_id: eventId });
    }

    @Get()
    findByEvent(@Param('eventId') eventId: string) {
        return this.participantsService.findAllByEvent(eventId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateParticipantDto: any) {
        return this.participantsService.update(id, updateParticipantDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.participantsService.remove(id);
    }
}
