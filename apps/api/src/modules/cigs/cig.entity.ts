import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CigType } from '@maku/shared-types';
import type { Member } from '../members/member.entity';
import type { CigMeeting } from './cig-meeting.entity';

@Entity('cigs')
export class Cig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'enum', enum: CigType, default: CigType.GEOGRAPHY })
  type!: CigType;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate!: string | null;

  @Column({ name: 'sub_location', type: 'varchar', length: 100, nullable: true })
  subLocation!: string | null;

  @Column({ name: 'chairperson_member_id', type: 'uuid', nullable: true })
  chairpersonMemberId!: string | null;

  @Column({ name: 'secretary_member_id', type: 'uuid', nullable: true })
  secretaryMemberId!: string | null;

  @Column({ name: 'treasurer_member_id', type: 'uuid', nullable: true })
  treasurerMemberId!: string | null;

  @ManyToMany('Member', 'cigs')
  members?: Member[];

  @OneToMany('CigMeeting', (m: CigMeeting) => m.cig)
  meetings?: CigMeeting[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
