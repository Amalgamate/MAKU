import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cig } from './cig.entity';

export enum CigDocumentCategory {
  MINUTES       = 'minutes',
  CONSTITUTION  = 'constitution',
  REGISTRATION  = 'registration',
  FINANCIAL     = 'financial',
  PROJECT       = 'project',
  CORRESPONDENCE= 'correspondence',
  OTHER         = 'other',
}

@Entity('cig_documents')
export class CigDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cig, { onDelete: 'CASCADE' })
  cig!: Cig;

  @Column({ name: 'cig_id' })
  cigId!: string;

  @Column({ type: 'varchar', length: 300 })
  name!: string;

  @Column({
    type: 'enum',
    enum: CigDocumentCategory,
    default: CigDocumentCategory.OTHER,
  })
  category!: CigDocumentCategory;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl!: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType!: string | null;

  @Column({ name: 'year', type: 'int', nullable: true })
  year!: number | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
