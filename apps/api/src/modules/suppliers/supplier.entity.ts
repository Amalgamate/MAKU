import {
  Column, CreateDateColumn, Entity,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum SupplierCategory {
  LIVESTOCK   = 'livestock',
  FEED        = 'feed',
  VETERINARY  = 'veterinary',
  EQUIPMENT   = 'equipment',
  TRANSPORT   = 'transport',
  SERVICES    = 'services',
  OTHER       = 'other',
}

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 300 })
  name!: string;

  @Column({ type: 'enum', enum: SupplierCategory, default: SupplierCategory.OTHER })
  category!: SupplierCategory;

  @Column({ name: 'contact_name', type: 'varchar', length: 255, nullable: true })
  contactName!: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'physical_address', type: 'varchar', length: 500, nullable: true })
  physicalAddress!: string | null;

  @Column({ name: 'kra_pin', type: 'varchar', length: 20, nullable: true })
  kraPin!: string | null;

  @Column({ name: 'bank_name', type: 'varchar', length: 200, nullable: true })
  bankName!: string | null;

  @Column({ name: 'bank_account', type: 'varchar', length: 50, nullable: true })
  bankAccount!: string | null;

  @Column({ name: 'mpesa_number', type: 'varchar', length: 20, nullable: true })
  mpesaNumber!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
