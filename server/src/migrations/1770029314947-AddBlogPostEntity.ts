import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogPostEntity1770029314947 implements MigrationInterface {
  name = 'AddBlogPostEntity1770029314947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blog_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "title" character varying(200) NOT NULL, "content" text NOT NULL, "excerpt" text, "featuredImage" character varying, "status" character varying NOT NULL DEFAULT 'draft', "publishedAt" TIMESTAMP, "metaDescription" character varying, "metaKeywords" character varying, "tags" text, "category" character varying, "viewCount" integer NOT NULL DEFAULT '0', "readTime" integer NOT NULL DEFAULT '0', "author_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5b2818a2c45c3edb9991b1c7a51" UNIQUE ("slug"), CONSTRAINT "PK_dd2add25eac93daefc93da9d387" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5b2818a2c45c3edb9991b1c7a5" ON "blog_posts" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45509cc49b36b76935300060e3" ON "blog_posts" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_076978b911d4ed78f6810d9ae6" ON "blog_posts" ("viewCount") `,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_posts" ADD CONSTRAINT "FK_c3fc4a3a656aad74331acfcf2a9" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_posts" DROP CONSTRAINT "FK_c3fc4a3a656aad74331acfcf2a9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_076978b911d4ed78f6810d9ae6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45509cc49b36b76935300060e3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5b2818a2c45c3edb9991b1c7a5"`,
    );
    await queryRunner.query(`DROP TABLE "blog_posts"`);
  }
}
