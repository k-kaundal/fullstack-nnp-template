import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * E2E Test Suite for API Endpoints
 * Tests the full application flow including database operations
 */
describe('API E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global prefix as in main.ts
    app.setGlobalPrefix('api/v1', {
      exclude: ['/'],
    });

    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('App Health Check', () => {
    it('GET / - should return API status', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'success');
          expect(res.body).toHaveProperty('statusCode', 200);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('message');
          expect(res.body.data).toHaveProperty('version');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });
});
