import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  // GET /v1/documents
  @Get()
  @ApiOperation({ summary: 'List documents with optional filters and pagination' })
  async findAll(
    @Query('category') category?: string,
    @Query('cigId') cigId?: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '25',
  ) {
    const p  = parseInt(page, 10);
    const pp = parseInt(perPage, 10);
    const { data, total } = await this.svc.findAll({ category, cigId, page: p, perPage: pp });
    return {
      data,
      meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) },
    };
  }

  // POST /v1/documents
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Upload / register a document' })
  async create(
    @Body() dto: CreateDocumentDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    return this.svc.create(dto, caller.sub);
  }
}
