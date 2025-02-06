import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeviceDto: CreateDeviceDto) {
    try {
      const device = await this.prisma.device.create({
        data: createDeviceDto,
      });
      return { status: 'success', data: device };
    } catch (error) {
      throw new NotFoundException({
        status: 'error',
        message: 'Failed to create device',
        details: error.message,
      });
    }
  }

  async findAll() {
    try {
      const devices = await this.prisma.device.findMany({
        include: { events: true }, 
      });
      return { status: 'success', data: devices };
    } catch (error) {
      throw new NotFoundException({
        status: 'error',
        message: 'Failed to fetch devices',
        details: error.message,
      });
    }
  }

  async findOne(id: number) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: { events: true }, 
    });
    if (!device) {
      throw new NotFoundException({
        status: 'fail',
        message: `Device with ID ${id} not found`,
      });
    }
    return { status: 'success', data: device };
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });
    if (!device) {
      throw new NotFoundException({
        status: 'fail',
        message: `Device with ID ${id} not found`,
      });
    }
    return { status: 'success', data: device };
  }


  async remove(id: number) {
    try {
      await this.prisma.device.delete({
        where: { id },
      });
      return { status: 'success', data: `Device with ID ${id} has been deleted` };
    } catch (error) {
      throw new NotFoundException({
        status: 'fail',
        message: `Device with ID ${id} not found`,
      });
    }
  }
}
