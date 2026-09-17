import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstructorsTable1789590002000 implements MigrationInterface {
  name = 'CreateInstructorsTable1789590002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "instructors" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(160) NOT NULL,
        CONSTRAINT "PK_instructors_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_instructors_name" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "instructors"`);
  }
}
