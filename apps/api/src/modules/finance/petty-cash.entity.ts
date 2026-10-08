import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

export enum PettyCashAction {
  TOP_UP   = 'top_up',
  EXPENSE  = 'expense',
  RECONCILE= 'reconcile',
}

@Entity('petty_cash_entries')
export class PettyCashEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate!: string;

  @Column({ type: 'enum', enum: PettyCashAction })
  action!: PettyCashAction;

  @Column({ type: 'varchar', length: 300 })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceAfter!: number;

  @Column({ name: 'receipt_ref', type: 'varchar', length: 100, nullable: true })
  receiptRef!: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
