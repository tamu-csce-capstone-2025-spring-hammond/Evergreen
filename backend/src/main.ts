import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to be objects of the DTO class
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Evergreen API')
    // .setDescription('Your API Description')
    .setVersion('1.0')
    // .addTag('auth') // Optional: Add tags for grouping endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document); // 'api' is the path where Swagger UI will be available

  await app.listen(3000);
}
bootstrap();
