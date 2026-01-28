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
  let createdUserId: string;

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

  describe('Users API', () => {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      firstName: 'John',
      lastName: 'Doe',
      password: 'SecurePass123!',
    };

    describe('POST /api/v1/users - Create User', () => {
      it('should create a new user successfully', () => {
        return request(app.getHttpServer())
          .post('/api/v1/users')
          .send(testUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('statusCode', 201);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('email', testUser.email);
            expect(res.body.data).toHaveProperty(
              'firstName',
              testUser.firstName,
            );
            expect(res.body.data).toHaveProperty('lastName', testUser.lastName);
            expect(res.body.data).not.toHaveProperty('password'); // Password should not be returned
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('user_id');
            expect(res.body.meta).toHaveProperty('created_at');

            // Save the user ID for later tests
            createdUserId = res.body.data.id;
          });
      });

      it('should return error if email already exists', () => {
        return request(app.getHttpServer())
          .post('/api/v1/users')
          .send(testUser)
          .expect(409)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'error');
            expect(res.body).toHaveProperty('statusCode', 409);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('already exists');
          });
      });

      it('should return error if email is invalid', () => {
        return request(app.getHttpServer())
          .post('/api/v1/users')
          .send({
            ...testUser,
            email: 'invalid-email',
          })
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 400);
          });
      });

      it('should return error if required fields are missing', () => {
        return request(app.getHttpServer())
          .post('/api/v1/users')
          .send({
            email: testUser.email,
          })
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty('statusCode', 400);
          });
      });
    });

    describe('GET /api/v1/users - Get All Users', () => {
      it('should return paginated list of users', () => {
        return request(app.getHttpServer())
          .get('/api/v1/users')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('total');
            expect(res.body.meta).toHaveProperty('page');
            expect(res.body.meta).toHaveProperty('limit');
            expect(res.body.meta).toHaveProperty('total_pages');
            expect(res.body.meta).toHaveProperty('has_next');
            expect(res.body.meta).toHaveProperty('has_previous');
          });
      });

      it('should accept pagination parameters', () => {
        return request(app.getHttpServer())
          .get('/api/v1/users?page=1&limit=5')
          .expect(200)
          .expect((res) => {
            expect(res.body.meta).toHaveProperty('page', 1);
            expect(res.body.meta).toHaveProperty('limit', 5);
          });
      });
    });

    describe('GET /api/v1/users/:id - Get User by ID', () => {
      it('should return user by ID', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/users/${createdUserId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('id', createdUserId);
            expect(res.body.data).toHaveProperty('email', testUser.email);
            expect(res.body.data).not.toHaveProperty('password');
          });
      });

      it('should return error for non-existent user', () => {
        const fakeId = '123e4567-e89b-12d3-a456-426614174000';
        return request(app.getHttpServer())
          .get(`/api/v1/users/${fakeId}`)
          .expect(404)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'error');
            expect(res.body).toHaveProperty('statusCode', 404);
          });
      });

      it('should return error for invalid UUID', () => {
        return request(app.getHttpServer())
          .get('/api/v1/users/invalid-id')
          .expect(400);
      });
    });

    describe('PATCH /api/v1/users/:id - Update User', () => {
      it('should update user successfully', () => {
        const updateData = {
          firstName: 'Jane',
          lastName: 'Smith',
        };

        return request(app.getHttpServer())
          .patch(`/api/v1/users/${createdUserId}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty(
              'firstName',
              updateData.firstName,
            );
            expect(res.body.data).toHaveProperty(
              'lastName',
              updateData.lastName,
            );
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('user_id', createdUserId);
          });
      });

      it('should return error for non-existent user', () => {
        const fakeId = '123e4567-e89b-12d3-a456-426614174000';
        return request(app.getHttpServer())
          .patch(`/api/v1/users/${fakeId}`)
          .send({ firstName: 'Test' })
          .expect(404)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'error');
            expect(res.body).toHaveProperty('statusCode', 404);
          });
      });
    });

    describe('DELETE /api/v1/users/:id - Delete User', () => {
      it('should return error for non-existent user', () => {
        const fakeId = '123e4567-e89b-12d3-a456-426614174000';
        return request(app.getHttpServer())
          .delete(`/api/v1/users/${fakeId}`)
          .expect(404)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'error');
            expect(res.body).toHaveProperty('statusCode', 404);
          });
      });

      it('should delete user successfully', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/users/${createdUserId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('statusCode', 200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('deleted');
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('user_id', createdUserId);
          });
      });

      it('should verify user is deleted', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/users/${createdUserId}`)
          .expect(404);
      });
    });
  });
});
