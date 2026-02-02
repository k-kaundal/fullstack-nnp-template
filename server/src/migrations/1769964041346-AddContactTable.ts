import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactTable1769964041346 implements MigrationInterface {
  name = 'AddContactTable1769964041346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contacts_status_enum" AS ENUM('new', 'read', 'replied', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "subject" character varying NOT NULL, "message" text NOT NULL, "status" "public"."contacts_status_enum" NOT NULL DEFAULT 'new', "ipAddress" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TYPE "public"."contacts_status_enum"`);
  }
}
