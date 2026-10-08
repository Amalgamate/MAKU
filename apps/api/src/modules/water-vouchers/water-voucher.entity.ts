import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum VoucherStatus {
  ISSUED   = 'issued',
  USED     = 'used',
  EXPIRED  = 'expired',
  CANCELLED= 'cancelled',
}

@Entity('water_vouchers')
export class WaterVoucher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'voucher_number', type: 'varchar', length: 30, unique: true })
  voucherNumber!: string;

  // ── Member ────────────────────────────────────────────────────────────────
  @Index()
  @Column({ name: 'member_id', type: 'uuid' })
  memberId!: string;

  // ── Allocation ────────────────────────────────────────────────────────────
  @Column({ name: 'litres_allocated', type: 'decimal', precision: 10, scale: 2 })
  litresAllocated!: number;

  @Column({ name: 'litres_used', type: 'decimal', precision: 10, scale: 2, default: 0 })
  litresUsed!: number;

  @Column({ name: 'borehole_name', type: 'varchar', length: 200, nullable: true })
  boreholeName!: string | null;

  @Column({ name: 'cost_per_litre', type: 'decimal', precision: 8, scale: 4, default: 0 })
  costPerLitre!: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCost!: number;

  // ── Dates ─────────────────────────────────────────────────────────────────
  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate!: string | null;

  @Column({ name: 'used_date', type: 'date', nullable: true })
  usedDate!: string | null;

  // ── Status ────────────────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.ISSUED })
  status!: VoucherStatus;

  @Column({ name: 'cig_id', type: 'uuid', nullable: true })
  cigId!: string | null;

  @Column({ name: 'issued_by', type: 'uuid', nullable: true })
  issuedBy!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
