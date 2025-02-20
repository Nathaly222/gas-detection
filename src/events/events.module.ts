import { Module} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; 
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationService } from 'src/notification/notification.service';
import { TwilioService } from '../twilio.service';  // Importar TwilioService

@Module({
  controllers: [EventsController],
  providers: [EventsService, NotificationService, TwilioService],  // Agregar TwilioService
  imports: [PrismaModule, HttpModule]
})
export class EventsModule {}
