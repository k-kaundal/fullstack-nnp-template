import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USERNAME'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: configService.get('NODE_ENV') === 'development',

  // SSL configuration for production databases (Aiven, Neon, etc.)
  ssl:
    configService.get('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,

  // Connection pool optimization for better performance
  extra: {
    max: configService.get('NODE_ENV') === 'production' ? 10 : 5, // Max connections
    min: configService.get('NODE_ENV') === 'production' ? 2 : 1, // Min connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Wait max 5s for connection
    statement_timeout: 10000, // Max query execution time: 10s
  },
});
