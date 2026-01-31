import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionsTable1769868189934 implements MigrationInterface {
  name = 'AddSessionsTable1769868189934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "refreshToken" text NOT NULL,
                "deviceName" character varying(255),
                "deviceType" character varying(100),
                "ipAddress" character varying(45),
                "userAgent" text,
                "expiresAt" TIMESTAMP NOT NULL,
                "lastActivityAt" TIMESTAMP,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_user_sessions" ON "sessions" ("userId", "isActive")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_refresh_token" ON "sessions" ("refreshToken")
        `);

    await queryRunner.query(`
            ALTER TABLE "sessions"
            ADD CONSTRAINT "FK_sessions_users"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_users"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_refresh_token"`);
    await queryRunner.query(`DROP INDEX "IDX_user_sessions"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
