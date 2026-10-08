import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum ProjectStatus { PLANNING = 'planning', ACTIVE = 'active', ON_HOLD = 'on_hold', COMPLETED = 'completed', CANCELLED = 'cancelled' }

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 300 }) title!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.PLANNING }) status!: ProjectStatus;
  @Column({ name: 'grant_id', type: 'uuid', nullable: true }) grantId!: string | null;
  @Column({ name: 'ngo_id', type: 'uuid', nullable: true }) ngoId!: string | null;
  @Column({ name: 'start_date', type: 'date', nullable: true }) startDate!: string | null;
  @Column({ name: 'end_date', type: 'date', nullable: true }) endDate!: string | null;
  @Column({ name: 'budget', type: 'decimal', precision: 14, scale: 2, default: 0 }) budget!: number;
  @Column({ name: 'spent', type: 'decimal', precision: 14, scale: 2, default: 0 }) spent!: number;
  @Column({ name: 'progress_pct', type: 'int', default: 0 }) progressPct!: number;
  @Column({ name: 'lead_staff_id', type: 'uuid', nullable: true }) leadStaffId!: string | null;
  @Column({ name: 'milestones', type: 'jsonb', default: '[]' }) milestones!: Array<{ title: string; dueDate: string; completed: boolean }>;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
