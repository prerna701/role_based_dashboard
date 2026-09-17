import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnrollmentsTable1789590005000 implements MigrationInterface {
  name = 'CreateEnrollmentsTable1789590005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "enrollments" (
        "id" BIGSERIAL NOT NULL,
        "student_id" bigint NOT NULL,
        "course_id" bigint NOT NULL,
        "enrolled_on" date NOT NULL,
        "completion_status" character varying(30) NOT NULL,
        "grade" character varying(2),
        "rating" integer NOT NULL,
        "fee_paid" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_enrollments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_enrollments_student_course" UNIQUE ("student_id", "course_id"),
        CONSTRAINT "CHK_enrollments_completion_status"
          CHECK ("completion_status" IN ('completed', 'in_progress', 'dropped')),
        CONSTRAINT "CHK_enrollments_grade"
          CHECK ("grade" IS NULL OR "grade" IN ('A', 'B', 'C')),
        CONSTRAINT "CHK_enrollments_grade_matches_completion"
          CHECK (
            ("completion_status" = 'completed' AND "grade" IS NOT NULL)
            OR ("completion_status" <> 'completed' AND "grade" IS NULL)
          ),
        CONSTRAINT "CHK_enrollments_rating_range"
          CHECK ("rating" BETWEEN 1 AND 5),
        CONSTRAINT "CHK_enrollments_fee_paid_non_negative"
          CHECK ("fee_paid" >= 0),
        CONSTRAINT "FK_enrollments_student_id" FOREIGN KEY ("student_id")
          REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_enrollments_course_id" FOREIGN KEY ("course_id")
          REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_enrollments_course" ON "enrollments" ("course_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_enrollments_enrolled_on" ON "enrollments" ("enrolled_on")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_enrollments_enrolled_on"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_enrollments_course"`);
    await queryRunner.query(`DROP TABLE "enrollments"`);
  }
}
