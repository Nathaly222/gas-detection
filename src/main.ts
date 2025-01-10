import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const cors = require('cors');
  
  app.use(cors({
    origin: 'http://localhost:8081', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
  
}


bootstrap();
