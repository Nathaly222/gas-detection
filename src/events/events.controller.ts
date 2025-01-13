import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Auth } from 'src/auth/dto/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Auth(ValidRoles.ADMIN) // Solo admin y operator pueden crear eventos
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Auth() // Todos los usuarios autenticados pueden ver los eventos
  @Get()
  async findAll() {
    return this.eventsService.findAll();
  }

  @Auth() // Todos los usuarios autenticados pueden ver un evento en específico
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Auth(ValidRoles.ADMIN) // Solo admin y operator pueden eliminar eventos
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
