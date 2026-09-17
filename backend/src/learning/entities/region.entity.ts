import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { StudentEntity } from './student.entity';

@Entity({ name: 'regions' })
export class RegionEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @OneToMany(() => StudentEntity, (student) => student.region)
  students?: StudentEntity[];
}
