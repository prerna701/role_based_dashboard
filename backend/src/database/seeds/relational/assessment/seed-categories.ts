import { EntityManager } from 'typeorm';
import { CourseSeed } from './assessment-seed.types';

export async function seedCategories(
  manager: EntityManager,
  courses: CourseSeed[],
): Promise<void> {
  const categories = [...new Set(courses.map((course) => course.category))];

  for (const category of categories) {
    await manager.query(
      `
        INSERT INTO "categories" ("name")
        VALUES ($1)
        ON CONFLICT ("name") DO UPDATE SET "name" = EXCLUDED."name"
      `,
      [category],
    );
  }
}
