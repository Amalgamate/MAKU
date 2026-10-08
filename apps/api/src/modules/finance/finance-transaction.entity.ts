import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  INCOME  = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  // Income
  LIVESTOCK_COMMISSION = 'livestock_commission',
  MEMBERSHIP_FEE       = 'membership_fee',
  SHARE_CAPITAL        = 'share_capital',
  WATER_VOUCHER        = 'water_voucher',
  DONOR_GRANT          = 'donor_grant',
  OTHER_INCOME         = 'other_income',
  // Expense
  STAFF_SALARY         = 'staff_salary',
  OPERATIONS           = 'operations',
  TRANSPORT            = 'transport',
  MARKETING            = 'marketing',
  MAINTENANCE          = 'maintenance',
  OFFICE               = 'office',
  PETTY_CASH           = 'petty_cash',
  OTHER_EXPENSE        = 'other_expense',
}

export enum PaymentMethod {
  CASH         = 'cash',
  MPESA        = 'mpesa',
  BANK_TRANSFER= 'bank_transfer',
  CHEQUE       = 'cheque',
}

@Entity('finance_transactions')
export class FinanceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate!: string;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'enum', enum: TransactionCategory })
  category!: TransactionCategory;

  @Column({ type: 'varchar', length: 500 })
  description!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount!: number;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod!: PaymentMethod;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber!: string | null;

  // Optional links to source modules
  @Column({ name: 'member_id', type: 'uuid', nullable: true })
  memberId!: string | null;

  @Column({ name: 'livestock_transaction_id', type: 'uuid', nullable: true })
  livestockTransactionId!: string | null;

  @Column({ name: 'voucher_id', type: 'uuid', nullable: true })
  voucherId!: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'receipt_url', type: 'varchar', length: 500, nullable: true })
  receiptUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
