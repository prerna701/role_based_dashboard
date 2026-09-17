import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRegionsTable1789590000000 implements MigrationInterface {
  name = 'CreateRegionsTable1789590000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "regions" (
        "code" character varying(20) NOT NULL,
        "name" character varying(80) NOT NULL,
        CONSTRAINT "PK_regions_code" PRIMARY KEY ("code")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "regions"`);
  }
}
