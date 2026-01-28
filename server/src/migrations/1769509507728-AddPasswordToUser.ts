import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToUser1769509507728 implements MigrationInterface {
  name = 'AddPasswordToUser1769509507728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add password column as nullable first
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying`,
    );

    // Set a default password for existing users (they should change it later)
    // Default password: ChangeMe123! (users must change this on first login)
    const defaultHashedPassword =
      '$2b$10$n0V71rOUhGlq3SxLCEZYrOmSxlytyGixQ75YQSubvmD88CUCoANJ2';
    await queryRunner.query(
      `UPDATE "users" SET "password" = '${defaultHashedPassword}' WHERE "password" IS NULL`,
    );

    // Make password column NOT NULL
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }
}
