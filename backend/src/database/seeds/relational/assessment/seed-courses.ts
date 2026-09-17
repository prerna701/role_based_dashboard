import { EntityManager } from 'typeorm';
import { CourseSeed } from './assessment-seed.types';

export async function seedCourses(
  manager: EntityManager,
  courses: CourseSeed[],
): Promise<Map<string, string>> {
  const courseIds = new Map<string, string>();

  for (const course of courses) {
    const [category] = await manager.query(
      `SELECT "id" FROM "categories" WHERE "name" = $1`,
      [course.category],
    );
    const [instructor] = await manager.query(
      `SELECT "id" FROM "instructors" WHERE "name" = $1`,
      [course.instructor],
    );

    const [savedCourse] = await manager.query(
      `
        INSERT INTO "courses"
          ("external_id", "title", "category_id", "instructor_id", "level", "duration_weeks")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("external_id") DO UPDATE SET
          "title" = EXCLUDED."title",
          "category_id" = EXCLUDED."category_id",
          "instructor_id" = EXCLUDED."instructor_id",
          "level" = EXCLUDED."level",
          "duration_weeks" = EXCLUDED."duration_weeks"
        RETURNING "id"
      `,
      [
        course.id,
        course.title,
        category.id,
        instructor.id,
        course.level,
        course.duration_weeks,
      ],
    );

    courseIds.set(course.id, savedCourse.id);
  }

  return courseIds;
}
