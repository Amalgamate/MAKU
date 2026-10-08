import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum LivestockSpecies {
  CATTLE  = 'cattle',
  GOAT    = 'goat',
  CAMEL   = 'camel',
  SHEEP   = 'sheep',
  CHICKEN = 'chicken',
  OTHER   = 'other',
}

export enum LivestockTransactionStatus {
  PENDING   = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('livestock_transactions')
export class LivestockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ── Market day info ──────────────────────────────────────────────────────
  @Column({ name: 'market_date', type: 'date' })
  marketDate!: string;

  @Column({ name: 'market_location', type: 'varchar', length: 200, nullable: true })
  marketLocation!: string | null;

  // ── Parties ──────────────────────────────────────────────────────────────
  @Index()
  @Column({ name: 'seller_member_id', type: 'uuid' })
  sellerMemberId!: string;

  @Column({ name: 'buyer_name', type: 'varchar', length: 255 })
  buyerName!: string;

  @Column({ name: 'buyer_phone', type: 'varchar', length: 20, nullable: true })
  buyerPhone!: string | null;

  // ── Livestock details ────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: LivestockSpecies, default: LivestockSpecies.CATTLE })
  species!: LivestockSpecies;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'total_weight_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalWeightKg!: number | null;

  // ── Financials ───────────────────────────────────────────────────────────
  @Column({ name: 'price_per_unit', type: 'decimal', precision: 12, scale: 2 })
  pricePerUnit!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'maku_commission', type: 'decimal', precision: 12, scale: 2, default: 0 })
  makuCommission!: number;

  @Column({ name: 'member_proceeds', type: 'decimal', precision: 14, scale: 2 })
  memberProceeds!: number;

  // ── Payment ──────────────────────────────────────────────────────────────
  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'cash' })
  paymentMethod!: string;

  @Column({ name: 'mpesa_reference', type: 'varchar', length: 50, nullable: true })
  mpesaReference!: string | null;

  @Column({ name: 'payment_confirmed', type: 'boolean', default: false })
  paymentConfirmed!: boolean;

  // ── Status / meta ─────────────────────────────────────────────────────────
  @Column({ type: 'enum', enum: LivestockTransactionStatus, default: LivestockTransactionStatus.COMPLETED })
  status!: LivestockTransactionStatus;

  @Column({ name: 'cig_id', type: 'uuid', nullable: true })
  cigId!: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
