import { EntityManager } from 'typeorm';
import { StudentSeed } from './assessment-seed.types';

export async function seedRegions(
  manager: EntityManager,
  students: StudentSeed[],
): Promise<void> {
  const regions = [...new Set(students.map((student) => student.region))];

  for (const region of regions) {
    await manager.query(
      `
        INSERT INTO "regions" ("code", "name")
        VALUES ($1, $1)
        ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name"
      `,
      [region],
    );
  }
}
