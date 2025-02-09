import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { RoleModule } from './role/role.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, UsersModule, EventsModule, AuthModule, DeviceModule, RoleModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
