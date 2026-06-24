import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Fix for Windows TLS/SSL error with MongoDB Atlas and some HTTPS endpoints
// (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR on Windows dev machines)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CLIENT_URL') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  const port = Number(configService.get<string>('PORT')) || 5000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api`,
  );
}

void bootstrap();
