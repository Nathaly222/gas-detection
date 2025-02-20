import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { EventType } from '@prisma/client';

export class CreateEventDto {

    @IsEnum(EventType)
    @IsNotEmpty()
    eventType: EventType;

    @IsNumber()
    @IsPositive()
    gasConcentration: number;

    @IsNumber()
    @IsPositive()
    device_id: number;

    @IsNumber()
    @IsPositive()
    userId?: number;
}
