import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CommodityType {
  HONEY        = 'honey',
  DAIRY        = 'dairy',
  HIDES        = 'hides',
  POULTRY      = 'poultry',
  BONES        = 'bones',
  CONSERVATION = 'conservation',
}

export enum CommodityAction { COLLECTION = 'collection', SALE = 'sale', PROCESSING = 'processing' }

@Entity('commodity_transactions')
export class CommodityTransaction {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'commodity_type', type: 'enum', enum: CommodityType }) commodityType!: CommodityType;
  @Column({ name: 'action', type: 'enum', enum: CommodityAction }) action!: CommodityAction;
  @Column({ name: 'transaction_date', type: 'date' }) @Index() transactionDate!: string;
  @Column({ name: 'member_id', type: 'uuid', nullable: true }) memberId!: string | null;
  @Column({ name: 'cig_id', type: 'uuid', nullable: true }) cigId!: string | null;
  @Column({ type: 'decimal', precision: 12, scale: 3 }) quantity!: number;
  @Column({ name: 'unit', type: 'varchar', length: 20, default: 'kg' }) unit!: string;
  @Column({ name: 'quality_grade', type: 'varchar', length: 50, nullable: true }) qualityGrade!: string | null;
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, default: 0 }) unitPrice!: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2, default: 0 }) totalAmount!: number;
  @Column({ name: 'buyer_name', type: 'varchar', length: 255, nullable: true }) buyerName!: string | null;
  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true }) paymentMethod!: string | null;
  @Column({ name: 'recorded_by', type: 'uuid', nullable: true }) recordedBy!: string | null;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
