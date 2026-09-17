import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../../data-source';
import { readAssessmentSeed } from './read-assessment-seed';
import { seedAssessmentUsers } from './seed-assessment-users';
import { seedCategories } from './seed-categories';
import { seedCourses } from './seed-courses';
import { seedEnrollments } from './seed-enrollments';
import { seedInstructors } from './seed-instructors';
import { seedRegions } from './seed-regions';
import { seedRoles } from './seed-roles';
import { seedStatuses } from './seed-statuses';
import { seedStudents } from './seed-students';

async function run(dataSource: DataSource): Promise<void> {
  const seed = readAssessmentSeed();

  await dataSource.transaction(async (manager) => {
    await seedRoles(manager);
    await seedStatuses(manager);
    await seedRegions(manager, seed.students);
    await seedCategories(manager, seed.courses);
    await seedInstructors(manager, seed.courses);

    const courseIds = await seedCourses(manager, seed.courses);
    const studentIds = await seedStudents(manager, seed.students);

    await seedEnrollments(manager, seed.students, studentIds, courseIds);
    await seedAssessmentUsers(manager);
  });
}

AppDataSource.initialize()
  .then(async (dataSource) => {
    await run(dataSource);
    await dataSource.destroy();
    console.log('Assessment database seed completed.');
  })
  .catch((error: unknown) => {
    console.error('Assessment database seed failed.');
    console.error(error);
    process.exit(1);
  });
