import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum PurchaseType { PURCHASE = 'purchase', SALE = 'sale' }

export enum PurchaseStatus {
  DRAFT     = 'draft',
  CONFIRMED = 'confirmed',
  PAID      = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('purchase_transactions')
export class PurchaseTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 50, unique: true })
  referenceNumber!: string;

  @Column({ name: 'transaction_date', type: 'date' })
  @Index()
  transactionDate!: string;

  @Column({ type: 'enum', enum: PurchaseType })
  type!: PurchaseType;

  @Column({ type: 'enum', enum: PurchaseStatus, default: PurchaseStatus.CONFIRMED })
  status!: PurchaseStatus;

  // For purchases: supplier; for sales: buyer name/member
  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId!: string | null;

  @Column({ name: 'buyer_name', type: 'varchar', length: 300, nullable: true })
  buyerName!: string | null;

  @Column({ name: 'member_id', type: 'uuid', nullable: true })
  memberId!: string | null;

  @Column({ type: 'varchar', length: 300 })
  description!: string;

  @Column({ name: 'line_items', type: 'jsonb', default: '[]' })
  lineItems!: Array<{ item: string; qty: number; unitPrice: number; total: number }>;

  @Column({ name: 'subtotal', type: 'decimal', precision: 14, scale: 2 })
  subtotal!: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 14, scale: 2, default: 0 })
  amountPaid!: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod!: string | null;

  @Column({ name: 'payment_reference', type: 'varchar', length: 100, nullable: true })
  paymentReference!: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
