import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Project } from './project.entity';
import type { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectRepository(Project) private readonly repo: Repository<Project>) {}

  async create(dto: CreateProjectDto): Promise<Project> { return this.repo.save(this.repo.create(dto)); }

  async findAll(status?: string): Promise<Project[]> {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC');
    if (status) qb.andWhere('p.status = :status', { status });
    return qb.getMany();
  }

  async findById(id: string): Promise<Project> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async update(id: string, dto: Partial<CreateProjectDto> & { spent?: number }): Promise<Project> {
    const p = await this.findById(id);
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  toDto(p: Project) {
    return {
      id: p.id, title: p.title, description: p.description, status: p.status,
      grantId: p.grantId, ngoId: p.ngoId, startDate: p.startDate, endDate: p.endDate,
      budget: Number(p.budget), spent: Number(p.spent), progressPct: p.progressPct,
      leadStaffId: p.leadStaffId, milestones: p.milestones,
      notes: p.notes, createdAt: p.createdAt.toISOString(),
    };
  }
}
