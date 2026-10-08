import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gender, MemberStatus } from '@maku/shared-types';
import type { Cig } from '../cigs/cig.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'member_number', type: 'varchar', length: 20, nullable: true })
  memberNumber!: string | null;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Index({ unique: true })
  @Column({ name: 'national_id', type: 'varchar', length: 20 })
  nationalId!: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender!: Gender | null;

  @Column({ name: 'phone_primary', type: 'varchar', length: 20 })
  phonePrimary!: string;

  @Column({ name: 'phone_secondary', type: 'varchar', length: 20, nullable: true })
  phoneSecondary!: string | null;

  @Column({ name: 'sub_location', type: 'varchar', length: 100, nullable: true })
  subLocation!: string | null;

  @Column({ name: 'village', type: 'varchar', length: 100, nullable: true })
  village!: string | null;

  @Column({ name: 'gps_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  gpsLat!: number | null;

  @Column({ name: 'gps_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  gpsLng!: number | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl!: string | null;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING })
  status!: MemberStatus;

  @Column({ name: 'registration_date', type: 'date', default: () => 'CURRENT_DATE' })
  registrationDate!: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'rejection_reason', type: 'varchar', length: 500, nullable: true })
  rejectionReason!: string | null;

  @Column({ name: 'share_contributions', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shareContributions!: number;

  @Column({ name: 'cattle_count', type: 'int', default: 0 })
  cattleCount!: number;

  @Column({ name: 'goat_count', type: 'int', default: 0 })
  goatCount!: number;

  @Column({ name: 'camel_count', type: 'int', default: 0 })
  camelCount!: number;

  @Column({ name: 'sheep_count', type: 'int', default: 0 })
  sheepCount!: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  // ─── Next of kin ──────────────────────────────────────────────────────────

  @Column({ name: 'next_of_kin_name', type: 'varchar', length: 255, nullable: true })
  nextOfKinName!: string | null;

  @Column({ name: 'next_of_kin_relationship', type: 'varchar', length: 100, nullable: true })
  nextOfKinRelationship!: string | null;

  @Column({ name: 'next_of_kin_phone', type: 'varchar', length: 20, nullable: true })
  nextOfKinPhone!: string | null;

  // ─── Contributions ────────────────────────────────────────────────────────

  @Column({ name: 'membership_fee_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  membershipFeePaid!: number;

  @Column({ name: 'share_capital_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shareCapitalPaid!: number;

  @ManyToMany('Cig', 'members')
  @JoinTable({
    name: 'member_cig_memberships',
    joinColumn: { name: 'member_id' },
    inverseJoinColumn: { name: 'cig_id' },
  })
  cigs?: Cig[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
