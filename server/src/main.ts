import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as express from 'express';

// Express app for serverless
const expressApp = express();
let cachedApp: any;

/**
 * Create and configure NestJS application
 * Reuses the same instance for serverless environments
 */
async function createApp() {
  if (!cachedApp) {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { logger: ['error', 'warn', 'log'] },
    );

    // Global prefix (exclude root health check)
    app.setGlobalPrefix('api/v1', {
      exclude: ['/'],
    });

    // CORS configuration
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Fullstack NNP API')
      .setDescription('NestJS + Next.js + PostgreSQL Template API')
      .setVersion('1.0')
      .addTag('users')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    cachedApp = app;

    logger.log('NestJS application initialized');
  }

  return cachedApp;
}

/**
 * Bootstrap function for traditional deployment
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  await createApp();

  const port = process.env.PORT || 3001;
  await expressApp.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
