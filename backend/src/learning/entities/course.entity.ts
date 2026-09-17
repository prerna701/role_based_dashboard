import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { EnrollmentEntity } from './enrollment.entity';
import { InstructorEntity } from './instructor.entity';

export enum CourseLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

@Entity({ name: 'courses' })
@Index('uq_courses_external_id', ['externalId'], { unique: true })
@Index('idx_courses_category', ['categoryId'])
@Index('idx_courses_instructor', ['instructorId'])
export class CourseEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'external_id', type: 'varchar', length: 30 })
  externalId: string;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: string;

  @ManyToOne(() => CategoryEntity, (category) => category.courses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ name: 'instructor_id', type: 'bigint' })
  instructorId: string;

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.courses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor: InstructorEntity;

  @Column({ type: 'varchar', length: 30 })
  level: CourseLevel;

  @Column({ name: 'duration_weeks', type: 'int' })
  durationWeeks: number;

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.course)
  enrollments?: EnrollmentEntity[];
}
