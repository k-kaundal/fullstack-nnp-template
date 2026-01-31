import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequestLogsTable1769882059159 implements MigrationInterface {
  name = 'AddRequestLogsTable1769882059159';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_users"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_user_sessions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_token"`);
    await queryRunner.query(
      `CREATE TABLE "request_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "method" character varying(10) NOT NULL, "path" character varying(500) NOT NULL, "statusCode" integer NOT NULL, "responseTime" integer NOT NULL, "userId" character varying(255), "ipAddress" character varying(45), "userAgent" character varying(500), "requestBody" text, "queryParams" text, "errorMessage" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1edd3815ae37a9b9511f5a26dca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cbe054bbd219e1070f1e93694c" ON "request_logs" ("method", "path") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_96ca790725861f7b54ce7636f4" ON "request_logs" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd9fadac0a36aadff6741150ce" ON "request_logs" ("createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fd9fadac0a36aadff6741150ce"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_96ca790725861f7b54ce7636f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cbe054bbd219e1070f1e93694c"`,
    );
    await queryRunner.query(`DROP TABLE "request_logs"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_token" ON "sessions" ("refreshToken") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_sessions" ON "sessions" ("userId", "isActive") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
