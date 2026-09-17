import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1789590001000 implements MigrationInterface {
  name = 'CreateCategoriesTable1789590001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(120) NOT NULL,
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
