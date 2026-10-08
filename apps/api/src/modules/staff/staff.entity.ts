import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum EmploymentType { PERMANENT = 'permanent', CONTRACT = 'contract', CASUAL = 'casual' }
export enum StaffStatus    { ACTIVE = 'active', ON_LEAVE = 'on_leave', TERMINATED = 'terminated' }

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'staff_number', type: 'varchar', length: 20, unique: true, nullable: true }) staffNumber!: string | null;
  @Column({ name: 'full_name', type: 'varchar', length: 255 }) fullName!: string;
  @Column({ name: 'national_id', type: 'varchar', length: 20, nullable: true }) nationalId!: string | null;
  @Column({ type: 'varchar', length: 50 }) role!: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) department!: string | null;
  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true }) phone!: string | null;
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true }) email!: string | null;
  @Column({ name: 'employment_type', type: 'enum', enum: EmploymentType, default: EmploymentType.PERMANENT }) employmentType!: EmploymentType;
  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.ACTIVE }) status!: StaffStatus;
  @Column({ name: 'hire_date', type: 'date' }) hireDate!: string;
  @Column({ name: 'end_date', type: 'date', nullable: true }) endDate!: string | null;
  @Column({ name: 'basic_salary', type: 'decimal', precision: 12, scale: 2, default: 0 }) basicSalary!: number;
  @Column({ name: 'nhif_number', type: 'varchar', length: 30, nullable: true }) nhifNumber!: string | null;
  @Column({ name: 'nssf_number', type: 'varchar', length: 30, nullable: true }) nssfNumber!: string | null;
  @Column({ name: 'kra_pin', type: 'varchar', length: 20, nullable: true }) kraPin!: string | null;
  @Column({ name: 'bank_name', type: 'varchar', length: 200, nullable: true }) bankName!: string | null;
  @Column({ name: 'bank_account', type: 'varchar', length: 50, nullable: true }) bankAccount!: string | null;
  @Column({ name: 'mpesa_number', type: 'varchar', length: 20, nullable: true }) mpesaNumber!: string | null;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
