import { NotificationService } from '../notification/notification.service';
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
    private readonly notificationService: NotificationService,
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
      if (response.data > 30) {
        await this.create({
          eventType: EventType.FUGA_DETECTADA,
          gasConcentration: response.data,
          device_id: 1,
        });
      }
      return { 
        status: 'success', 
        data: {
          gas_concentration: response.data, 
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
      return { 
        status: 'success', 
        data: {
          fan_state: response.data,  // Devolvemos el estado del ventilador
        }
      };
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
  
      if (state) {
        await this.create({
          eventType: EventType.VENTILADOR_ENCENDIDO,
          gasConcentration: 0, // Aquí puedes obtener el valor actual del gas
          device_id: 1
        });
      }
  
      return { 
        status: 'success', 
        data: {
          fan_state: response.data,  // Devolvemos el estado del ventilador actualizado
        }
      };
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
      console.log('Obteniendo estado de la válvula...');
      const response = await lastValueFrom(
        this.httpService.get(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateView',
          { headers: this.headers.esp32motor }
        ),
      );
  
      console.log('Respuesta de Thinger:', response.data);
  
      return {
        status: 'success',
        data: {
          valve_state: response.data === "Válvula Abierta",  
          raw_state: response.data
        }
      };
    } catch (error) {
      console.error('Error al obtener estado:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Error al obtener el estado de la válvula',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  async getNotificationDanger() {
    try {
      const notifications = await this.prisma.events.findMany({
        select: {
          event_type: true,  
          event_time: true,  
          gas_concentration: true, 
        },
        orderBy: { event_time: 'desc' }, 
      });
  
      return {
        status: 'success',
        data: notifications,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch notifications',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  

  async getGasDataByDay() {
    try {
      const gasData = await this.prisma.events.groupBy({
        by: ['event_time'],
        _avg: {
          gas_concentration: true,
        },
        orderBy: {
          event_time: 'asc', // Ordenar por fecha ascendente
        },
      });
  
      // Mapeo de los datos para que solo se muestren la fecha y la concentración promedio
      const formattedData = gasData.map(item => ({
        date: item.event_time.toISOString().split('T')[0], // Fecha sin la parte de tiempo
        avg_concentration: item._avg.gas_concentration,
      }));
  
      return {
        status: 'success',
        data: formattedData,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch gas data by day',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
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


  // Nuevos métodos para controlar la válvula

  async setValveStateCerrar(state: boolean) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateManualCerrado',
          state,  // Enviamos el estado directamente
          { headers: this.headers.esp32motor },
        ),
      );

      // Si la válvula se cierra, se registra un evento
      if (!state) {
        await this.create({
          eventType: EventType.VALVULA_CERRADA,
          gasConcentration: 0, // Suponiendo que la concentración de gas sea 0 cuando la válvula está cerrada
          device_id: 1 // Aquí puedes ajustar según el ID del dispositivo
        });
      }
      
      return { 
        status: 'success', 
        data: {
          valve_state: response.data,  // Aquí devuelves el estado de la válvula
        }
      };
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

  async setValveStateAbrir(state: boolean) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://backend.thinger.io/v3/users/FernandoEn/devices/esp32_motor/resources/MotorStateManualAbierto',
          state,  
          { headers: this.headers.esp32motor },
        ),
      );      
      return { 
        status: 'success', 
        data: {
          valve_state: response.data,  // Aquí devuelves el estado de la válvula
        }
      };
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
}

