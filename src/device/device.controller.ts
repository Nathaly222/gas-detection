import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, BadRequestException } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Auth } from 'src/auth/dto/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // Solo ADMIN puede crear dispositivos
  @Auth(ValidRoles.ADMIN)
  @Post()
  @HttpCode(201)
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  // Todos los usuarios pueden ver los dispositivos
  @Auth()
  @Get()
  async findAll() {
    return this.deviceService.findAll();
  }

  // Todos los usuarios pueden ver un dispositivo específico
  @Auth()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(Number(id));
  }

  // Solo ADMIN puede actualizar dispositivos
  @Auth(ValidRoles.ADMIN)
  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.deviceService.update(Number(id), updateDeviceDto);
  }

  // Solo ADMIN puede eliminar dispositivos
  @Auth(ValidRoles.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return this.deviceService.remove(Number(id));
  }
}
