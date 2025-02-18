import { Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio.Twilio;

  constructor() {
    const accountSid =process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = '+14155238886'; // Tu número de Twilio (asegúrate de usar el formato correcto)

    this.client = Twilio(accountSid, authToken);
  }

  // Método para enviar SMS
  async sendSms(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        body,   // El cuerpo del mensaje
        from: '+14155238886', // El número de Twilio
        to,     // El número del destinatario
      });

      return message;
    } catch (error) {
      throw new Error(`Error sending SMS: ${error.message}`);
    }
  }

  // Método para enviar WhatsApp
  async sendWhatsapp(to: string, body: string) {
    try {
      const message = await this.client.messages.create({
        body,
        from: `whatsapp:+14155238886`, // Formato de número para WhatsApp
        to: `whatsapp:${to}`,           // Formato de número para WhatsApp
      });

      return message;
    } catch (error) {
      throw new Error(`Error sending WhatsApp message: ${error.message}`);
    }
  }
}
