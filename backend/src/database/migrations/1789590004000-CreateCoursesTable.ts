import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesTable1789590004000 implements MigrationInterface {
  name = 'CreateCoursesTable1789590004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "courses" (
        "id" BIGSERIAL NOT NULL,
        "external_id" character varying(30) NOT NULL,
        "title" character varying(180) NOT NULL,
        "category_id" bigint NOT NULL,
        "instructor_id" bigint NOT NULL,
        "level" character varying(30) NOT NULL,
        "duration_weeks" integer NOT NULL,
        CONSTRAINT "PK_courses_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_courses_external_id" UNIQUE ("external_id"),
        CONSTRAINT "CHK_courses_level"
          CHECK ("level" IN ('Beginner', 'Intermediate', 'Advanced')),
        CONSTRAINT "CHK_courses_duration_weeks_positive"
          CHECK ("duration_weeks" > 0),
        CONSTRAINT "FK_courses_category_id" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "FK_courses_instructor_id" FOREIGN KEY ("instructor_id")
          REFERENCES "instructors"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_courses_category" ON "courses" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_courses_instructor" ON "courses" ("instructor_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_courses_instructor"`);
    await queryRunner.query(`DROP INDEX "public"."idx_courses_category"`);
    await queryRunner.query(`DROP TABLE "courses"`);
  }
}
