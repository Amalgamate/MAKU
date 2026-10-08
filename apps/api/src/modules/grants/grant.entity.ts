import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum GrantStatus { PROSPECTING = 'prospecting', APPLIED = 'applied', AWARDED = 'awarded', ACTIVE = 'active', COMPLETED = 'completed', REJECTED = 'rejected' }

@Entity('grants')
export class Grant {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 300 }) title!: string;
  @Column({ name: 'donor_name', type: 'varchar', length: 300 }) donorName!: string;
  @Column({ name: 'ngo_id', type: 'uuid', nullable: true }) ngoId!: string | null;
  @Column({ type: 'enum', enum: GrantStatus, default: GrantStatus.PROSPECTING }) status!: GrantStatus;
  @Column({ name: 'amount_requested', type: 'decimal', precision: 14, scale: 2, default: 0 }) amountRequested!: number;
  @Column({ name: 'amount_awarded', type: 'decimal', precision: 14, scale: 2, default: 0 }) amountAwarded!: number;
  @Column({ name: 'amount_disbursed', type: 'decimal', precision: 14, scale: 2, default: 0 }) amountDisbursed!: number;
  @Column({ name: 'deadline', type: 'date', nullable: true }) deadline!: string | null;
  @Column({ name: 'award_date', type: 'date', nullable: true }) awardDate!: string | null;
  @Column({ name: 'end_date', type: 'date', nullable: true }) endDate!: string | null;
  @Column({ name: 'focus_area', type: 'varchar', length: 200, nullable: true }) focusArea!: string | null;
  @Column({ name: 'reporting_schedule', type: 'varchar', length: 100, nullable: true }) reportingSchedule!: string | null;
  @Column({ name: 'next_report_due', type: 'date', nullable: true }) nextReportDue!: string | null;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
