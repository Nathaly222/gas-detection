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

  @Auth()
  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  @Auth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  // Obtener el valor del gas
  @Auth()
  @Get('gas-value')
  async getGasValue() {
    return this.eventsService.getGasValue();
  }

  // Ruta para obtener el estado del ventilador
  @Auth()
  @Get('fan-state')
  async getFanState() {
    return this.eventsService.getFanState();
  }

    // Ruta para obtener el estado de la válvula
    @Auth()
    @Get('valve-state')
    async getValveState() {
      return this.eventsService.getValveState();
    }

  // Ruta para abrir/cerrar la válvula de gas
  @Auth()
  @Post('valve-state')
  @HttpCode(200)
  async setValveState(@Body('state') state: boolean) {
    if (typeof state !== 'boolean') {
      throw new BadRequestException('Invalid state. Use "true" for open or "false" for close.');
    }
    return this.eventsService.setValveState(state);
  }

  // Ruta para encender o apagar el ventilador
  @Auth()
  @Post('fan-state')
  @HttpCode(200)
  async setFanState(@Body('state') state: boolean) {
    if (typeof state !== 'boolean') {
      throw new BadRequestException('Invalid state. Use "true" or "false".');
    }
    return this.eventsService.setFanState(state);
  }

  // Ruta para obtener notificaciones de peligro de gas
  @Auth()
  @Get('notification-danger')
  async getNotificationDanger() {
    return this.eventsService.getNotificationDanger();
  }
}
