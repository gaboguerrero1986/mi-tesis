import { Controller, Get, Post, Body, Param, UseGuards, Query, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EavService } from './eav.service';

@UseGuards(AuthGuard('jwt'))
@Controller('eav')
export class EavController {
    constructor(private readonly eavService: EavService) {}

    @Get('parameters')
    async getParameters(
        @Query('entity') entity: string,
        @Query('activeOnly') activeOnly: string
    ) {
        return this.eavService.getParametersByEntity(entity, activeOnly === 'true');
    }

    @Post('parameters')
    async createParameter(@Body() body: { entity: string, description: string, dataType: string }) {
        return this.eavService.createParameter(body.entity, body.description, body.dataType);
    }

    @Delete('parameters/:id')
    async deleteParameter(@Param('id') id: number) {
        return this.eavService.deleteParameter(id);
    }

    @Post('parameters/:id/toggle')
    async toggleParameter(@Param('id') id: number) {
        return this.eavService.toggleParameter(id);
    }

    @Get('values/:recordId')
    async getValues(@Param('recordId') recordId: string) {
        return this.eavService.getValuesByRecord(recordId);
    }

    @Post('values/:recordId')
    async saveValue(
        @Param('recordId') recordId: string,
        @Body() body: { parameterId: number, value: any }
    ) {
        return this.eavService.saveParameterValue(recordId, body.parameterId, body.value);
    }

    @Post('values/batch/:recordId')
    async saveBatchValues(
        @Param('recordId') recordId: string,
        @Body() body: { values: { parameterId: number, value: any }[] }
    ) {
        const results: any[] = [];
        for (const item of body.values) {
            if (item.value !== null && item.value !== '') {
                results.push(await this.eavService.saveParameterValue(recordId, item.parameterId, item.value));
            }
        }
        return results;
    }
}
