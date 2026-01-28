import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    // Set required environment variables for e2e tests
    process.env.NODE_ENV = 'test';
    process.env.PORT = '3001';
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '5432';
    process.env.DATABASE_USERNAME = 'postgres';
    process.env.DATABASE_PASSWORD = 'postgres';
    process.env.DATABASE_NAME = 'test_db';
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRATION = '7d';
    process.env.CORS_ORIGIN = 'http://localhost:3000';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
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
      });
  });
});
