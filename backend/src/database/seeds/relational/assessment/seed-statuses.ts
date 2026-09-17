import { EntityManager } from 'typeorm';

export async function seedStatuses(manager: EntityManager): Promise<void> {
  await manager.query(`
    INSERT INTO "status" ("id", "name")
    VALUES (1, 'Active'), (2, 'Inactive')
    ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
  `);
}
