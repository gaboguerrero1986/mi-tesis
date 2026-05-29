import { Controller, Post, Body, Get, UseGuards, Request, Delete, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() body: any) {
        const { usuarioData, personaData } = body;
        return this.usersService.create(usuarioData, personaData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id')
    update(@Param('id') id: string, @Body() body: any) {
        const { usuarioData, personaData } = body;
        return this.usersService.update(id, usuarioData, personaData);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Request() req) {
        const role = req.query.role;
        if (role) {
            return this.usersService.findAllByRole(role);
        }
        return this.usersService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/reset-password')
    resetPassword(@Param('id') id: string) {
        return this.usersService.resetPassword(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/change-password')
    changePassword(@Param('id') id: string, @Body() body: any) {
        return this.usersService.changePassword(id, body.oldPassword, body.newPassword);
    }
}
