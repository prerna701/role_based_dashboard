import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity({ name: 'categories' })
@Index('uq_categories_name', ['name'], { unique: true })
export class CategoryEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @OneToMany(() => CourseEntity, (course) => course.category)
  courses?: CourseEntity[];
}
