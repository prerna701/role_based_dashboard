import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EnrollmentEntity } from './enrollment.entity';
import { RegionEntity } from './region.entity';

@Entity({ name: 'students' })
@Index('idx_students_region', ['regionCode'])
@Index('uq_students_external_id', ['externalId'], { unique: true })
export class StudentEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ name: 'external_id', type: 'varchar', length: 30 })
  externalId: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ name: 'region_code', type: 'varchar', length: 20 })
  regionCode: string;

  @ManyToOne(() => RegionEntity, (region) => region.students, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'region_code', referencedColumnName: 'code' })
  region: RegionEntity;

  @Column({ name: 'joined_on', type: 'date' })
  joinedOn: string;

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.student)
  enrollments?: EnrollmentEntity[];
}
