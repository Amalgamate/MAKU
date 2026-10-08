import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Ngo } from './ngo.entity';
import type { CreateNgoDto } from './dto/create-ngo.dto';

@Injectable()
export class NgosService {
  constructor(@InjectRepository(Ngo) private readonly repo: Repository<Ngo>) {}

  async create(dto: CreateNgoDto): Promise<Ngo> { return this.repo.save(this.repo.create(dto)); }

  async findAll(search?: string): Promise<Ngo[]> {
    const qb = this.repo.createQueryBuilder('n').orderBy('n.name', 'ASC');
    if (search) qb.andWhere('n.name ILIKE :s OR n.country ILIKE :s', { s: `%${search}%` });
    return qb.getMany();
  }

  async findById(id: string): Promise<Ngo> {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) throw new NotFoundException('NGO not found');
    return n;
  }

  async update(id: string, dto: Partial<CreateNgoDto>): Promise<Ngo> {
    const n = await this.findById(id);
    Object.assign(n, dto);
    return this.repo.save(n);
  }

  toDto(n: Ngo) {
    return {
      id: n.id, name: n.name, country: n.country, contactName: n.contactName,
      contactEmail: n.contactEmail, contactPhone: n.contactPhone,
      focusAreas: n.focusAreas, partnershipStart: n.partnershipStart,
      mouSigned: n.mouSigned, mouExpiry: n.mouExpiry,
      isActive: n.isActive, notes: n.notes, createdAt: n.createdAt.toISOString(),
    };
  }
}
