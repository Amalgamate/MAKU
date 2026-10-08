import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

export enum FeedlotAnimalStatus {
  ACTIVE = 'active',
  SOLD   = 'sold',
  DIED   = 'died',
}

@Entity('feedlot_animals')
export class FeedlotAnimal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'animal_tag', type: 'varchar', length: 50 })
  animalTag!: string;

  @Column({ type: 'varchar', length: 50, default: 'cattle' })
  species!: string;

  @Index()
  @Column({ name: 'member_id', type: 'uuid', nullable: true })
  memberId!: string | null;

  @Column({ name: 'intake_date', type: 'date' })
  intakeDate!: string;

  @Column({ name: 'intake_weight_kg', type: 'decimal', precision: 10, scale: 2 })
  intakeWeightKg!: number;

  @Column({ name: 'current_weight_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentWeightKg!: number | null;

  @Column({ name: 'daily_feed_cost_kes', type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyFeedCostKes!: number;

  @Column({ type: 'enum', enum: FeedlotAnimalStatus, default: FeedlotAnimalStatus.ACTIVE })
  status!: FeedlotAnimalStatus;

  @Column({ name: 'sale_date', type: 'date', nullable: true })
  saleDate!: string | null;

  @Column({ name: 'sale_price_kes', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salePriceKes!: number | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
