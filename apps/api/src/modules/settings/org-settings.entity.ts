import {
  Column,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('org_settings')
export class OrgSettings {
  @PrimaryColumn({ type: 'varchar', length: 5 })
  id!: string;

  @Column({ name: 'org_name', type: 'varchar', length: 200, default: 'MAKU' })
  orgName!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  tagline!: string | null;

  /** Holds base64 data URLs or remote URLs — stored as text to support large base64 payloads */
  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'primary_color', type: 'varchar', length: 20, default: '#7e2710' })
  primaryColor!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
