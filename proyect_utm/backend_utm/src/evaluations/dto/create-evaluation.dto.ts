import { IsString, IsArray, ValidateNested, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class EvaluationDetailDto {
    @IsString()
    @IsNotEmpty()
    metricId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    value: number;
}

export class CreateEvaluationDto {
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsString()
    @IsNotEmpty()
    participantId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvaluationDetailDto)
    details: EvaluationDetailDto[];

    @IsString()
    comments: string;
}
