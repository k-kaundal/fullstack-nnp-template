#!/usr/bin/env ts-node

/**
 * Database Seeder CLI
 * Run: yarn seed or yarn seed:rollback
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeederService } from './seeder.service';
import { UsersSeeder } from './users.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);
  const usersSeeder = app.get(UsersSeeder);

  // Register seeders
  seederService.register('users', usersSeeder);

  const command = process.argv[2];

  try {
    switch (command) {
      case 'run':
        await seederService.runAll();
        break;
      case 'rollback':
        await seederService.rollbackAll();
        break;
      case 'clear':
        await seederService.clearDatabase();
        break;
      default:
        console.log('Available commands:');
        console.log('  run      - Run all seeders');
        console.log('  rollback - Rollback all seeders');
        console.log('  clear    - Clear database (⚠️  DANGER)');
        break;
    }
  } catch (error) {
    console.error('Seeder failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
