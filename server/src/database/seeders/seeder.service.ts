/**
 * Database Seeder Service
 * Manages database seeding for development and testing
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Seeder } from './seeder.interface';
import { UsersSeeder } from './users.seeder';
import { RbacSeeder } from './rbac.seeder';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private seeders: Map<string, Seeder> = new Map();

  constructor(
    private readonly dataSource: DataSource,
    private readonly usersSeeder: UsersSeeder,
    private readonly rbacSeeder: RbacSeeder,
  ) {
    // Register all seeders
    this.register('rbac', this.rbacSeeder); // RBAC first (users depend on roles)
    this.register('users', this.usersSeeder);
  }

  /**
   * Register a seeder
   * @param name - Seeder name
   * @param seeder - Seeder instance
   */
  register(name: string, seeder: Seeder): void {
    this.seeders.set(name, seeder);
    this.logger.log(`Registered seeder: ${name}`);
  }

  /**
   * Run all registered seeders
   * @returns Promise<void>
   */
  async runAll(): Promise<void> {
    this.logger.log('Running all seeders...');

    for (const [name, seeder] of this.seeders) {
      try {
        this.logger.log(`Running seeder: ${name}`);
        await seeder.run();
        this.logger.log(`✅ Seeder completed: ${name}`);
      } catch (error: unknown) {
        const stack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`❌ Seeder failed: ${name}`, stack);
        throw error;
      }
    }

    this.logger.log('✅ All seeders completed successfully');
  }

  /**
   * Run a specific seeder
   * @param name - Seeder name
   * @returns Promise<void>
   */
  async run(name: string): Promise<void> {
    const seeder = this.seeders.get(name);

    if (!seeder) {
      throw new Error(`Seeder not found: ${name}`);
    }

    this.logger.log(`Running seeder: ${name}`);
    await seeder.run();
    this.logger.log(`✅ Seeder completed: ${name}`);
  }

  /**
   * Rollback all seeders (if supported)
   * @returns Promise<void>
   */
  async rollbackAll(): Promise<void> {
    this.logger.log('Rolling back all seeders...');

    const seedersArray = Array.from(this.seeders.entries()).reverse();

    for (const [name, seeder] of seedersArray) {
      if (seeder.rollback) {
        try {
          this.logger.log(`Rolling back seeder: ${name}`);
          await seeder.rollback();
          this.logger.log(`✅ Rollback completed: ${name}`);
        } catch (error: unknown) {
          const stack = error instanceof Error ? error.stack : undefined;
          this.logger.error(`❌ Rollback failed: ${name}`, stack);
          throw error;
        }
      }
    }

    this.logger.log('✅ All rollbacks completed successfully');
  }

  /**
   * Clear all data from database (⚠️ DANGER: Use with caution)
   * @returns Promise<void>
   */
  async clearDatabase(): Promise<void> {
    this.logger.warn('⚠️  Clearing database...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Disable foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

      // Get all tables
      const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `);

      // Truncate all tables
      for (const table of tables) {
        const tableName = table.TABLE_NAME || table.table_name;
        await queryRunner.query(`TRUNCATE TABLE \`${tableName}\``);
        this.logger.log(`Truncated table: ${tableName}`);
      }

      // Re-enable foreign key checks
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');

      this.logger.log('✅ Database cleared successfully');
    } finally {
      await queryRunner.release();
    }
  }
}
