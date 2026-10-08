import {
  Column, CreateDateColumn, Entity, Index,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 50, default: 'other' })
  category!: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl!: string;

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize!: number | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType!: string | null;

  @Column({ type: 'int', nullable: true })
  year!: number | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy!: string | null;

  @Index()
  @Column({ name: 'cig_id', type: 'uuid', nullable: true })
  cigId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
