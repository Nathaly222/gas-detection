import { Controller, Get, Post, Body, Param, Delete, HttpCode, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Auth } from 'src/auth/dto/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { User } from 'src/auth/dto/decorators/user.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Auth(ValidRoles.ADMIN)
  @Post()
  @HttpCode(201) 
  async create(@Body() createEventDto: CreateEventDto, @User() user: any) {
    return this.eventsService.create(createEventDto, user.userId);
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

  

  @Auth()
  @Get('gas-value')
  async getGasValue(@User() user: any) {
    console.log('Usuario:', user);
    try {
      const result = await this.eventsService.getGasValue(user.userId);
      return result;  
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch gas value',
        details: error.message,
      };
    }
  }

  @Auth()
  @Get('gas-data')
  async getGasData() {
    return this.eventsService.getGasDataByDay();
  }

  @Auth()
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

  @Auth()
  @Post('fan-state')
  @HttpCode(200)
  async setFanState(@Body('state') state: boolean, @User() user: any) {
    if (typeof state !== 'boolean') {
      throw new BadRequestException('Invalid state. Use "true" or "false".');
    }
    try {
      return await this.eventsService.setFanState(state, user.userId );
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to set fan state',
        details: error.message,
      };
    }
  }

  @Auth()
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

  @Auth()
  @Post('valve-state-cerrar')
  @HttpCode(200)
  async setValveStateCerrar(@Body('state') state: boolean, @User() user: any) {
    // Verificamos que el estado sea un booleano antes de enviarlo al servicio
    if (typeof state !== 'boolean') {
      throw new BadRequestException('Invalid state. Must be a boolean value.');
    }

    try {
      return await this.eventsService.setValveStateCerrar(state, user.userId);
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to set valve state',
        details: error.message,
      };
    }
  }
 @Auth()
 @Post('valve-state-abrir')
 @HttpCode(200)
 async setValveStateAbrir(@Body('state') state: boolean) {
   // Verificamos que el estado sea un booleano antes de enviarlo al servicio
   if (typeof state !== 'boolean') {
     throw new BadRequestException('Invalid state. Must be a boolean value.');
   }

   try {
     return await this.eventsService.setValveStateAbrir(state);
   } catch (error) {
     return {
       status: 'error',
       message: 'Failed to set valve state',
       details: error.message,
     };
   }
 }

  @Auth()
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
