import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnrollmentFactsView1789590006000 implements MigrationInterface {
  name = 'CreateEnrollmentFactsView1789590006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE VIEW "enrollment_facts" AS
      SELECT
        e.id AS enrollment_id,
        e.enrolled_on,
        e.completion_status,
        e.grade,
        e.rating,
        e.fee_paid,
        s.id AS student_id,
        s.external_id AS student_external_id,
        s.name AS student_name,
        r.code AS region_code,
        r.name AS region_name,
        c.id AS course_id,
        c.external_id AS course_external_id,
        c.title AS course_title,
        c.level AS course_level,
        cat.id AS category_id,
        cat.name AS category_name,
        i.id AS instructor_id,
        i.name AS instructor_name
      FROM "enrollments" e
      INNER JOIN "students" s ON s.id = e.student_id
      INNER JOIN "regions" r ON r.code = s.region_code
      INNER JOIN "courses" c ON c.id = e.course_id
      INNER JOIN "categories" cat ON cat.id = c.category_id
      INNER JOIN "instructors" i ON i.id = c.instructor_id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "enrollment_facts"`);
  }
}
