import { EntityManager } from 'typeorm';
import { StudentSeed } from './assessment-seed.types';

export async function seedEnrollments(
  manager: EntityManager,
  students: StudentSeed[],
  studentIds: Map<string, string>,
  courseIds: Map<string, string>,
): Promise<void> {
  for (const student of students) {
    const studentId = studentIds.get(student.id);

    if (!studentId) {
      throw new Error(`Student not found for enrollment: ${student.id}`);
    }

    for (const enrollment of student.enrollments) {
      const courseId = courseIds.get(enrollment.course_id);

      if (!courseId) {
        throw new Error(
          `Course not found for enrollment: ${enrollment.course_id}`,
        );
      }

      await manager.query(
        `
          INSERT INTO "enrollments"
            ("student_id", "course_id", "enrolled_on", "completion_status", "grade", "rating", "fee_paid")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT ("student_id", "course_id") DO UPDATE SET
            "enrolled_on" = EXCLUDED."enrolled_on",
            "completion_status" = EXCLUDED."completion_status",
            "grade" = EXCLUDED."grade",
            "rating" = EXCLUDED."rating",
            "fee_paid" = EXCLUDED."fee_paid"
        `,
        [
          studentId,
          courseId,
          enrollment.enrolled_on,
          enrollment.completion_status,
          enrollment.grade,
          enrollment.rating,
          enrollment.fee_paid,
        ],
      );
    }
  }
}
