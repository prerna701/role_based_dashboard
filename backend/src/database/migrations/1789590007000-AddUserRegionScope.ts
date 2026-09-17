import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRegionScope1789590007000 implements MigrationInterface {
  name = 'AddUserRegionScope1789590007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "regionCode" character varying(20)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_region_code" ON "user" ("regionCode")`,
    );
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_region_code" FOREIGN KEY ("regionCode")
      REFERENCES "regions"("code") ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "CHK_user_role_region_scope"
      CHECK (
        ("roleId" <> 1 OR "regionCode" IS NULL)
        AND ("roleId" <> 3 OR "regionCode" IS NOT NULL)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "CHK_user_role_region_scope"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_region_code"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_user_region_code"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "regionCode"`);
  }
}
