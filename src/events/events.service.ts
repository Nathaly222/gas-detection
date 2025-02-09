import { HttpException, HttpStatus, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { EventType } from '@prisma/client';

@Injectable()
export class EventsService {
  private readonly headers = {
    esp32: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJlc3AzMiIsImlhdCI6MTczNzkzNDI3MSwianRpIjoiNjc5NmM1YmZlNjUwZDA2MWM1MDcxNDA5Iiwic3ZyIjoidXMtZWFzdC5hd3MudGhpbmdlci5pbyIsInVzciI6IkZlcm5hbmRvRW4ifQ.K88mwoMVfTwK1Q8LfL9Ujix6pt7CxolrFCNhpVF10ng`,
    },
    esp32motor: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXYiOiJlc3AzMl9tb3RvciIsImlhdCI6MTczNzkzNDMyMCwianRpIjoiNjc5NmM1ZjBlNjUwZDA2MWM1MDcxNDBhIiwic3ZyIjoidXMtZWFzdC5hd3MudGhpbmdlci5pbyIsInVzciI6IkZlcm5hbmRvRW4ifQ.6Nuoibl9nz9TzEt1r9Ox3BGdFmWVDLAtPTZctWnIkfE`,
    },
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

  async getGasValue() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/GasValue',
          { headers: this.headers.esp32 },
        ),
      );
      
      // Si el valor del gas supera el umbral, creamos un evento de fuga detectada
      if (response.data > 30) {
        await this.create({
          eventType: EventType.FUGA_DETECTADA,
          gasConcentration: response.data,
          device_id: 1 // Asegúrate de usar el ID correcto del dispositivo
        });
      }
      
      return { 
        status: 'success', 
        data: {
          value: response.data,
          threshold: 30,
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch gas value',
          details: error.response?.data || error.message,
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
          { headers: this.headers.esp32 },
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
          { headers: this.headers.esp32 },
        ),
      );

      // Si el ventilador se enciende, creamos un evento
      if (state) {
        await this.create({
          eventType: EventType.VENTILADOR_ENCENDIDO,
          gasConcentration: 0, // Aquí podrías obtener el valor actual del gas
          device_id: 1 // Asegúrate de usar el ID correcto del dispositivo
        });
      }

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

  async getValveState() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateView',
          { headers: this.headers.esp32motor }
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

  async setValveState(state: boolean) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateManual',
          state,
          { headers: this.headers.esp32motor },
        ),
      );

      // Si la válvula se cierra, creamos un evento
      if (!state) {
        await this.create({
          eventType: EventType.VALVULA_CERRADA,
          gasConcentration: 0, // Aquí podrías obtener el valor actual del gas
          device_id: 1 // Asegúrate de usar el ID correcto del dispositivo
        });
      }

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

  async getNotificationDanger() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/NotificationDanger',
          { headers: this.headers.esp32 },
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

  // Métodos de base de datos existentes
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
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid ID');
    }
    
    const event = await this.prisma.events.findUnique({
      where: { id },
      include: { device: true },
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
}