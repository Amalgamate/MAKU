import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';
import type { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier) private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(search?: string, category?: string): Promise<Supplier[]> {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.name', 'ASC');
    if (search)   qb.andWhere('s.name ILIKE :s OR s.contactName ILIKE :s', { s: `%${search}%` });
    if (category) qb.andWhere('s.category = :category', { category });
    return qb.getMany();
  }

  async findById(id: string): Promise<Supplier> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async update(id: string, dto: Partial<CreateSupplierDto>): Promise<Supplier> {
    const s = await this.findById(id);
    Object.assign(s, dto);
    return this.repo.save(s);
  }

  async deactivate(id: string): Promise<Supplier> {
    const s = await this.findById(id);
    s.isActive = false;
    return this.repo.save(s);
  }

  async rate(id: string, rating: number): Promise<Supplier> {
    const s = await this.findById(id);
    s.rating = Math.min(5, Math.max(0, rating));
    return this.repo.save(s);
  }

  toDto(s: Supplier) {
    return {
      id: s.id, name: s.name, category: s.category,
      contactName: s.contactName, phone: s.phone, email: s.email,
      physicalAddress: s.physicalAddress, kraPin: s.kraPin,
      bankName: s.bankName, bankAccount: s.bankAccount,
      mpesaNumber: s.mpesaNumber, isActive: s.isActive,
      rating: Number(s.rating), notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    };
  }
}
