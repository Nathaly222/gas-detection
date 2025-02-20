import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwilioService } from '../twilio.service';  // Importar TwilioService

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,  // Acceso a la base de datos
    private readonly twilioService: TwilioService,  // Servicio de Twilio
  ) {}

  // Método para enviar notificación solo al usuario específico
  async sendNotificationToUser(userId: number) {
    try {
      // Obtener el usuario específico de la base de datos
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          phone: true,  // Asegúrate de que 'phone' sea la columna donde almacenas el número
        },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Enviar mensaje solo al usuario correspondiente
      const phone = user.phone;
      const alertMessage = '🚨 ¡Alerta! Se ha detectado una fuga de gas en su hogar. Tome precauciones.';
      await this.twilioService.sendWhatsapp(phone, alertMessage);
      return { status: 'success', message: `Mensaje enviado al usuario con ID ${userId}.` };
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
      throw error;
    }
  }
}
