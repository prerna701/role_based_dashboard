import { EntityManager } from 'typeorm';

export async function seedRoles(manager: EntityManager): Promise<void> {
  await manager.query(`
    INSERT INTO "role" ("id", "name")
    VALUES (1, 'Admin'), (2, 'User'), (3, 'Region Manager')
    ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
  `);
}
