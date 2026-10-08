import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cig } from './cig.entity';

@Entity('cig_meetings')
export class CigMeeting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cig, (cig) => cig.meetings, { onDelete: 'CASCADE' })
  cig!: Cig;

  @Column({ name: 'cig_id' })
  cigId!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 500 })
  agenda!: string;

  @Column({ type: 'text', nullable: true })
  minutes!: string | null;

  @Column({ name: 'action_items', type: 'text', nullable: true })
  actionItems!: string | null;

  @Column({ name: 'attendance_count', type: 'int', default: 0 })
  attendanceCount!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  venue!: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
