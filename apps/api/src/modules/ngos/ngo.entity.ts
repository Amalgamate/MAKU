import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('ngos')
export class Ngo {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 300 }) name!: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) country!: string | null;
  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true }) contactName!: string | null;
  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true }) contactEmail!: string | null;
  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true }) contactPhone!: string | null;
  @Column({ name: 'focus_areas', type: 'text', nullable: true }) focusAreas!: string | null;
  @Column({ name: 'partnership_start', type: 'date', nullable: true }) partnershipStart!: string | null;
  @Column({ name: 'mou_signed', type: 'boolean', default: false }) mouSigned!: boolean;
  @Column({ name: 'mou_expiry', type: 'date', nullable: true }) mouExpiry!: string | null;
  @Column({ name: 'is_active', type: 'boolean', default: true }) isActive!: boolean;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
