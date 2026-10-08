import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Staff, StaffStatus } from './staff.entity';
import type { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(@InjectRepository(Staff) private readonly repo: Repository<Staff>) {}

  private async genNumber(): Promise<string> {
    const count = await this.repo.count();
    return `STF-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateStaffDto): Promise<Staff> {
    const staffNumber = await this.genNumber();
    return this.repo.save(this.repo.create({ ...dto, staffNumber }));
  }

  async findAll(search?: string): Promise<Staff[]> {
    const qb = this.repo.createQueryBuilder('s').where("s.status != 'terminated'").orderBy('s.fullName', 'ASC');
    if (search) qb.andWhere('s.fullName ILIKE :s OR s.role ILIKE :s', { s: `%${search}%` });
    return qb.getMany();
  }

  async findById(id: string): Promise<Staff> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Staff member not found');
    return s;
  }

  async update(id: string, dto: Partial<CreateStaffDto>): Promise<Staff> {
    const s = await this.findById(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async terminate(id: string, endDate: string): Promise<Staff> {
    const s = await this.findById(id);
    s.status = StaffStatus.TERMINATED;
    s.endDate = endDate;
    return this.repo.save(s);
  }

  toDto(s: Staff) {
    return {
      id: s.id, staffNumber: s.staffNumber, fullName: s.fullName,
      nationalId: s.nationalId, role: s.role, department: s.department,
      phone: s.phone, email: s.email, employmentType: s.employmentType,
      status: s.status, hireDate: s.hireDate, endDate: s.endDate,
      basicSalary: Number(s.basicSalary), nhifNumber: s.nhifNumber,
      nssfNumber: s.nssfNumber, kraPin: s.kraPin, bankName: s.bankName,
      bankAccount: s.bankAccount, mpesaNumber: s.mpesaNumber,
      notes: s.notes, createdAt: s.createdAt.toISOString(),
    };
  }
}
