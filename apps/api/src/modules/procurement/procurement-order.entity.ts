import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum ProcurementStatus {
  REQUISITION = 'requisition',
  QUOTING     = 'quoting',
  APPROVED    = 'approved',
  ORDERED     = 'ordered',
  RECEIVED    = 'received',
  CANCELLED   = 'cancelled',
}

@Entity('procurement_orders')
export class ProcurementOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'po_number', type: 'varchar', length: 30, unique: true })
  poNumber!: string;

  @Column({ name: 'requisition_date', type: 'date' })
  @Index()
  requisitionDate!: string;

  @Column({ type: 'enum', enum: ProcurementStatus, default: ProcurementStatus.REQUISITION })
  status!: ProcurementStatus;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId!: string | null;

  @Column({ name: 'budget_amount', type: 'decimal', precision: 14, scale: 2 })
  budgetAmount!: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 14, scale: 2, nullable: true })
  actualAmount!: number | null;

  @Column({ name: 'requires_quotes', type: 'boolean', default: false })
  requiresQuotes!: boolean;

  @Column({ name: 'quotes', type: 'jsonb', default: '[]' })
  quotes!: Array<{ supplier: string; amount: number; notes?: string }>;

  @Column({ name: 'requested_by', type: 'uuid', nullable: true })
  requestedBy!: string | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_date', type: 'date', nullable: true })
  approvedDate!: string | null;

  @Column({ name: 'expected_delivery', type: 'date', nullable: true })
  expectedDelivery!: string | null;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
