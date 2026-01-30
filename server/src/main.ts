import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { INestApplication } from '@nestjs/common';

/**
 * Creates and configures the NestJS application
 * Used for both local development and serverless deployment
 *
 * @returns Configured NestJS application instance
 */
async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

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

  return app;
}

/**
 * Bootstrap function for local development
 * Starts the application on specified port
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await createApp();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

// For Vercel serverless deployment
let cachedApp: INestApplication;

/**
 * Serverless handler for Vercel deployment
 * Creates a single cached NestJS app instance and exports it
 *
 * @returns Express app handler for Vercel
 */
export default async (req: unknown, res: unknown) => {
  if (!cachedApp) {
    cachedApp = await createApp();
    await cachedApp.init();
  }

  return cachedApp.getHttpAdapter().getInstance()(req, res);
};

bootstrap();
