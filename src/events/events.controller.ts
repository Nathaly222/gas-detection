import { Controller, Get, Post, Body, Param, Delete, HttpCode, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Auth } from 'src/auth/dto/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Auth(ValidRoles.ADMIN)
  @Post()
  @HttpCode(201) 
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  //@Auth()
  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }



  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  //@Auth()
  @Get('gas-value')
  async getGasValue() {
    try {
      const result = await this.eventsService.getGasValue();
      return result;  
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch gas value',
        details: error.message,
      };
    }
  }

  //@Auth()
  @Get('fan-state')
  async getFanState() {
    try {
      const result = await this.eventsService.getFanState();
      return result;
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch fan state',
        details: error.message,
      };
    }
  }
  //@Auth()
  @Get('valve-state')
  async getValveState() {
    try {
      const result = await this.eventsService.getValveState();
      return result;
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch valve state',
        details: error.message,
      };
    }
  }

  //@Auth()
  @Post('valve-state')
  @HttpCode(200)
  async setValveState(@Body('state') state: boolean) {
    // Cambiamos la validación para que sea más clara
    if (typeof state !== 'boolean') {
      throw new BadRequestException('Invalid state. Must be a boolean value.');
    }
    try {
      return await this.eventsService.setValveState(state);
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to set valve state',
        details: error.message,
      };
    }
  }

  //@Auth()
  @Post('fan-state')
  @HttpCode(200)
  async setFanState(@Body('state') state: boolean) {
    if (typeof state !== 'boolean') {
      throw new BadRequestException('Invalid state. Use "true" or "false".');
    }
    try {
      return await this.eventsService.setFanState(state);
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to set fan state',
        details: error.message,
      };
    }
  }

  //@Auth()
  @Get('notification-danger')
  async getNotificationDanger() {
    try {
      const result = await this.eventsService.getNotificationDanger();
      return result;
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch danger notification',
        details: error.message,
      };
    }
  }
}
