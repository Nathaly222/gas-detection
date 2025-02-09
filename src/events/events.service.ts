import { HttpException, HttpStatus, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

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
    // Verificación de si el id es válido
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID no válido');
    }
  
    console.log('Buscando evento con ID:', id);
  
    const event = await this.prisma.events.findUnique({
      where: { id },  // Busca un evento con el ID proporcionado
      include: { device: true },  // Incluye la relación con el dispositivo
    });
  
    if (!event) {
      throw new NotFoundException({
        status: 'fail',
        data: `Evento con ID ${id} no encontrado`,
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
      console.log('Enviando solicitud a Thinger.io para GasValue...');
  
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/GasValue',
          { headers: this.headers.esp32 } // ✅ Usa el token correcto
        ),
      );
  
      console.log('Gas value response:', response.data);
      return { status: 'success', data: response.data };
    } catch (error) {
      console.error('Error al obtener el valor del gas:', error.response?.data || error.message);
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
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32/resources/FanState',
          { headers: this.headers.esp32 },
        ),
      );
      console.log('Respuesta de la API GasValue:', response.data);
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
      console.log('Enviando solicitud a Thinger.io para MotorStateView...');
  
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateView',
          { headers: this.headers.esp32motor } 
        ),
      );
  
      console.log('Valve state response:', response.data);
      return { status: 'success', data: response.data };
    } catch (error) {
      console.error('Error al obtener el estado de la válvula:', error.response?.data || error.message);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch valve state',
          details: error.response?.data || error.message,
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
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateManual',
          state,
          { headers: this.headers.esp32motor },
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
}
