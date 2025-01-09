import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    try {
      const event = await this.prisma.events.create({
        data: {
          event_type: createEventDto.eventType,
          gas_concentration: createEventDto.gasConcentration,
          user: { connect: { id: createEventDto.userId } },
        },
      });
      return { status: 'success', data: event };
    } catch (error) {
      throw new NotFoundException({
        status: 'error',
        message: 'Failed to create event',
        details: error.message,
      });
    }
  }

  async findAll() {
    const events = await  this.prisma.events.findMany({
      include: { user: true},
    })
    return { status: 'success', data: events};
  }

  async findOne(id: number) {
    const event = await this.prisma.events.findUnique({
      where: { id },
      include: { user: true }, 
    });
    if (!event) {
      throw new NotFoundException({ status: 'fail', data: `Event with ID ${id} not found` });
    }
    return { status: 'success', data: event };
  }


  async remove(id: number) {
    try {
      await this.prisma.events.delete({
        where: { id },
      });
      return { status: 'success', data: `Event with ID ${id} has been deleted` };
    } catch (error) {
      throw new NotFoundException({ status: 'fail', data: `Event with ID ${id} not found` });
    }
  }
}
