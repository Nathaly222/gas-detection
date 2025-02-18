import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {  
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS
  app.enableCors({
    origin: '*', // Orígenes permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    credentials: true, // Permitir cookies y headers autorizados
  });

  await app.listen(3000);
}
bootstrap();



