import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentsTable1789590003000 implements MigrationInterface {
  name = 'CreateStudentsTable1789590003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" BIGSERIAL NOT NULL,
        "external_id" character varying(30) NOT NULL,
        "name" character varying(160) NOT NULL,
        "region_code" character varying(20) NOT NULL,
        "joined_on" date NOT NULL,
        CONSTRAINT "PK_students_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_students_external_id" UNIQUE ("external_id"),
        CONSTRAINT "FK_students_region_code" FOREIGN KEY ("region_code")
          REFERENCES "regions"("code") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_students_region" ON "students" ("region_code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_students_region"`);
    await queryRunner.query(`DROP TABLE "students"`);
  }
}
