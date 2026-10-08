import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { FeedlotAnimal } from './feedlot.entity';
import type { CreateFeedlotDto, UpdateFeedlotDto } from './dto/create-feedlot.dto';

@Injectable()
export class FeedlotService {
  constructor(
    @InjectRepository(FeedlotAnimal)
    private readonly repo: Repository<FeedlotAnimal>,
  ) {}

  async findAll(filters?: { status?: string; memberId?: string }): Promise<FeedlotAnimal[]> {
    const qb = this.repo.createQueryBuilder('f').orderBy('f.intakeDate', 'DESC');

    if (filters?.status)   qb.andWhere('f.status = :status',     { status: filters.status });
    if (filters?.memberId) qb.andWhere('f.memberId = :memberId', { memberId: filters.memberId });

    return qb.getMany();
  }

  async create(dto: CreateFeedlotDto): Promise<FeedlotAnimal> {
    const animal = this.repo.create({
      animalTag: dto.animalTag,
      species: dto.species,
      memberId: dto.memberId ?? null,
      intakeDate: dto.intakeDate,
      intakeWeightKg: dto.intakeWeightKg,
      dailyFeedCostKes: dto.dailyFeedCostKes ?? 0,
      notes: dto.notes ?? null,
    });
    return this.repo.save(animal);
  }

  async update(id: string, dto: UpdateFeedlotDto): Promise<FeedlotAnimal> {
    const animal = await this.repo.findOne({ where: { id } });
    if (!animal) throw new NotFoundException('Feedlot animal not found');
    Object.assign(animal, dto);
    return this.repo.save(animal);
  }
}
