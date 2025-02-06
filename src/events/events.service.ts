import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class EventsService {
  private readonly authorizationHeader = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Mzc5MzM3NDIsImlhdCI6MTczNzkyNjU0Miwicm9sZSI6InVzZXIiLCJ1c3IiOiJGZXJuYW5kb0VuIn0.o9SUeUTQIJjKaKBwSmImOR3dTcIZtc_ChSQCwIEEljY`,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async create(createEventDto: CreateEventDto) {
    try {
      const event = await this.prisma.events.create({
        data: {
          event_type: createEventDto.eventType,
          gas_concentration: createEventDto.gasConcentration,
          device: { connect: { id: createEventDto.device_id } },
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
    try {
      const events = await this.prisma.events.findMany({
        include: { device: true },
      });
      return { status: 'success', data: events };
    } catch (error) {
      throw new NotFoundException({
        status: 'error',
        message: 'Failed to fetch events',
        details: error.message,
      });
    }
  }


  async findOne(id: number) {
    console.log(id);
    const event = await this.prisma.events.findUnique({
      where: {
        id
      },
      include: {
        device: true
      }
    });
    if (!event) {
      throw new NotFoundException({
        status: 'fail',
        data: `Event with ID ${id} not found`,
      });
    }
    return { status: 'success', data: event };
  }
  


  async remove(id: number) {
    try {
      await this.prisma.events.delete({
        where: { id },
      });
      return {
        status: 'success',
        data: `Event with ID ${id} has been deleted`,
      };
    } catch (error) {
      throw new NotFoundException({
        status: 'fail',
        data: `Event with ID ${id} not found`,
      });
    }
  }

  async getGasValue() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/GasValue',
          { headers: this.authorizationHeader },
        ),
      );
      return { status: 'success', data: response.data };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch gas value',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getFanState() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/FanStateView',
          { headers: this.authorizationHeader },
        ),
      );
      return { status: 'success', data: response.data };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch fan state',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setFanState(state: boolean) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/FanState',
          state,
          { headers: this.authorizationHeader },
        ),
      );
      return { status: 'success', data: response.data };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to set fan state to ${state}`,
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Realiza una solicitud HTTP para obtener el estado de la válvula del motor.
  async getValveState() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateView',
          { headers: this.authorizationHeader },
        ),
      );
      return { status: 'success', data: response.data };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch valve state',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Establece el estado de la válvula del motor (encendido o apagado) mediante una solicitud HTTP.
  async setValveState(state: boolean) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorState',
          state,
          { headers: this.authorizationHeader },
        ),
      );
      return { status: 'success', data: response.data };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: `Failed to set valve state to ${state}`,
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Realiza una solicitud HTTP para obtener las notificaciones de peligro (como una posible fuga de gas).
  async getNotificationDanger() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/NotificationDanger',
          { headers: this.authorizationHeader },
        ),
      );
      return { status: 'success', data: response.data };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch danger notification',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
