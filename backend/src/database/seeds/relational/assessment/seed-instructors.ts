import { EntityManager } from 'typeorm';
import { CourseSeed } from './assessment-seed.types';

export async function seedInstructors(
  manager: EntityManager,
  courses: CourseSeed[],
): Promise<void> {
  const instructors = [...new Set(courses.map((course) => course.instructor))];

  for (const instructor of instructors) {
    await manager.query(
      `
        INSERT INTO "instructors" ("name")
        VALUES ($1)
        ON CONFLICT ("name") DO UPDATE SET "name" = EXCLUDED."name"
      `,
      [instructor],
    );
  }
}
