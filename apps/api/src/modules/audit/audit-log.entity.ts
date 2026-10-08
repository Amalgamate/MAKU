import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AuditAction } from '@maku/shared-types';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entityType!: string;

  @Index()
  @Column({ name: 'entity_id', type: 'varchar', length: 255 })
  entityId!: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ name: 'previous_value', type: 'jsonb', nullable: true })
  previousValue!: Record<string, unknown> | null;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue!: Record<string, unknown> | null;

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'user_full_name', type: 'varchar', length: 255, nullable: true })
  userFullName!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
