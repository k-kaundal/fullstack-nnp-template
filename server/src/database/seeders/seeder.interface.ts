/**
 * Database Seeder Interface
 * Base interface for all seeders
 */

export interface Seeder {
  /**
   * Run the seeder
   * @returns Promise<void>
   */
  run(): Promise<void>;

  /**
   * Rollback the seeder (optional)
   * @returns Promise<void>
   */
  rollback?(): Promise<void>;
}

/**
 * Seeder metadata
 */
export interface SeederMetadata {
  name: string;
  order: number;
  runInProduction?: boolean;
}
