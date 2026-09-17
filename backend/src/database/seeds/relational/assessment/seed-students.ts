import { EntityManager } from 'typeorm';
import { StudentSeed } from './assessment-seed.types';

export async function seedStudents(
  manager: EntityManager,
  students: StudentSeed[],
): Promise<Map<string, string>> {
  const studentIds = new Map<string, string>();

  for (const student of students) {
    const [savedStudent] = await manager.query(
      `
        INSERT INTO "students" ("external_id", "name", "region_code", "joined_on")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("external_id") DO UPDATE SET
          "name" = EXCLUDED."name",
          "region_code" = EXCLUDED."region_code",
          "joined_on" = EXCLUDED."joined_on"
        RETURNING "id"
      `,
      [student.id, student.name, student.region, student.joined_on],
    );

    studentIds.set(student.id, savedStudent.id);
  }

  return studentIds;
}
