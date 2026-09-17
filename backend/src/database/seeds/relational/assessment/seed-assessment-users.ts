import bcrypt from 'bcryptjs';
import { EntityManager } from 'typeorm';
import { AssessmentUserSeed } from './assessment-seed.types';

const ASSESSMENT_USERS: AssessmentUserSeed[] = [
  {
    email: 'admin@dashboard.test',
    password: 'Admin@123',
    firstName: 'Assessment',
    lastName: 'Admin',
    roleId: 1,
    regionCode: null,
  },
  {
    email: 'north.manager@dashboard.test',
    password: 'North@123',
    firstName: 'North',
    lastName: 'Manager',
    roleId: 3,
    regionCode: 'North',
  },
  {
    email: 'south.manager@dashboard.test',
    password: 'South@123',
    firstName: 'South',
    lastName: 'Manager',
    roleId: 3,
    regionCode: 'South',
  },
];

export async function seedAssessmentUsers(
  manager: EntityManager,
): Promise<void> {
  for (const user of ASSESSMENT_USERS) {
    const password = await bcrypt.hash(user.password, await bcrypt.genSalt());

    await manager.query(
      `
        INSERT INTO "user"
          ("email", "password", "provider", "firstName", "lastName", "roleId", "statusId", "regionCode")
        VALUES ($1, $2, 'email', $3, $4, $5, 1, $6)
        ON CONFLICT ("email") DO UPDATE SET
          "password" = EXCLUDED."password",
          "provider" = EXCLUDED."provider",
          "firstName" = EXCLUDED."firstName",
          "lastName" = EXCLUDED."lastName",
          "roleId" = EXCLUDED."roleId",
          "statusId" = EXCLUDED."statusId",
          "regionCode" = EXCLUDED."regionCode",
          "deletedAt" = NULL
      `,
      [
        user.email,
        password,
        user.firstName,
        user.lastName,
        user.roleId,
        user.regionCode,
      ],
    );
  }
}
