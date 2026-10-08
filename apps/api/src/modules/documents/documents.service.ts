import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Document } from './document.entity';
import type { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
  ) {}

  async findAll(filters: {
    category?: string;
    cigId?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: Document[]; total: number }> {
    const { category, cigId, page = 1, perPage = 25 } = filters;

    const qb = this.repo.createQueryBuilder('d').orderBy('d.createdAt', 'DESC');

    if (category) qb.andWhere('d.category = :category', { category });
    if (cigId)    qb.andWhere('d.cigId = :cigId', { cigId });

    const [data, total] = await qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    return { data, total };
  }

  async create(dto: CreateDocumentDto, userId: string): Promise<Document> {
    const doc = this.repo.create({
      title: dto.title,
      category: dto.category ?? 'other',
      fileUrl: dto.fileUrl,
      fileSize: dto.fileSize ?? null,
      mimeType: dto.mimeType ?? null,
      year: dto.year ?? null,
      description: dto.description ?? null,
      cigId: dto.cigId ?? null,
      uploadedBy: userId,
    });
    return this.repo.save(doc);
  }
}
