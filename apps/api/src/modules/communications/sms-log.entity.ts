import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

export enum SmsStatus {
  PENDING = 'pending',
  SENT    = 'sent',
  FAILED  = 'failed',
}

@Entity('sms_logs')
export class SmsLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recipient!: string | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'enum', enum: SmsStatus, default: SmsStatus.PENDING })
  status!: SmsStatus;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'sent_by', type: 'uuid', nullable: true })
  sentBy!: string | null;

  @Column({ name: 'member_count', type: 'int', nullable: true })
  memberCount!: number | null;

  @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
