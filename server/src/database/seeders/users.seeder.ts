/**
 * Users Seeder
 * Seeds initial users for development/testing
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Seeder } from './seeder.interface';

@Injectable()
export class UsersSeeder implements Seeder {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding users...');

    const users = [
      {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: await bcrypt.hash('Admin@123', 10),
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: await bcrypt.hash('User@123', 10),
        isEmailVerified: true,
        isActive: true,
      },
      {
        email: 'user2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: await bcrypt.hash('User@123', 10),
        isEmailVerified: false,
        isActive: true,
      },
      {
        email: 'inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        password: await bcrypt.hash('User@123', 10),
        isEmailVerified: true,
        isActive: false,
      },
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.usersRepository.create(userData);
        await this.usersRepository.save(user);
        this.logger.log(`✅ Created user: ${userData.email}`);
      } else {
        this.logger.log(`⏭️  User already exists: ${userData.email}`);
      }
    }

    this.logger.log('Users seeding completed');
  }

  async rollback(): Promise<void> {
    this.logger.log('Rolling back users seeder...');

    const emails = [
      'admin@example.com',
      'user1@example.com',
      'user2@example.com',
      'inactive@example.com',
    ];

    for (const email of emails) {
      await this.usersRepository.delete({ email });
      this.logger.log(`Deleted user: ${email}`);
    }

    this.logger.log('Users seeder rollback completed');
  }
}
