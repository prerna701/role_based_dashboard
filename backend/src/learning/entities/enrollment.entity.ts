import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CourseEntity } from './course.entity';
import { StudentEntity } from './student.entity';

export enum CompletionStatus {
  Completed = 'completed',
  InProgress = 'in_progress',
  Dropped = 'dropped',
}

export enum EnrollmentGrade {
  A = 'A',
  B = 'B',
  C = 'C',
}

@Entity({ name: 'enrollments' })
@Unique('uq_enrollments_student_course', ['studentId', 'courseId'])
@Index('idx_enrollments_course', ['courseId'])
@Index('idx_enrollments_enrolled_on', ['enrolledOn'])
@Check(
  'chk_enrollments_grade_matches_completion',
  `(("completion_status" = 'completed' AND "grade" IS NOT NULL) OR ("completion_status" <> 'completed' AND "grade" IS NULL))`,
)
@Check('chk_enrollments_rating_range', '"rating" BETWEEN 1 AND 5')
@Check('chk_enrollments_fee_paid_non_negative', '"fee_paid" >= 0')
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'student_id', type: 'bigint' })
  studentId: string;

  @ManyToOne(() => StudentEntity, (student) => student.enrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @Column({ name: 'course_id', type: 'bigint' })
  courseId: string;

  @ManyToOne(() => CourseEntity, (course) => course.enrollments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Column({ name: 'enrolled_on', type: 'date' })
  enrolledOn: string;

  @Column({ name: 'completion_status', type: 'varchar', length: 30 })
  completionStatus: CompletionStatus;

  @Column({ type: 'varchar', length: 2, nullable: true })
  grade: EnrollmentGrade | null;

  @Column({ type: 'int' })
  rating: number;

  @Column({ name: 'fee_paid', type: 'numeric', precision: 10, scale: 2 })
  feePaid: string;
}
