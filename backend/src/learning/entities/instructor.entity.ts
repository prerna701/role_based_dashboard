import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity({ name: 'instructors' })
@Index('uq_instructors_name', ['name'], { unique: true })
export class InstructorEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @OneToMany(() => CourseEntity, (course) => course.instructor)
  courses?: CourseEntity[];
}
