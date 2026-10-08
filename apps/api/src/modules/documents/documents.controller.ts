import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
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
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        category: { type: 'string' },
        year: { type: 'integer' },
        description: { type: 'string' },
        cigId: { type: 'string', format: 'uuid' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a document (max 10 MB)' })
  async create(
    @Body() body: Record<string, string>,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() caller: JwtPayload,
  ) {
    // Phase 3: stream to MinIO. For now, store locally.
    const fileUrl = `/uploads/documents/${file.filename || file.originalname}`;
    return this.svc.create(
      {
        title: body['title'] || file.originalname.replace(/\.[^.]+$/, ''),
        category: body['category'] ?? 'other',
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        year: body['year'] ? parseInt(body['year'], 10) : undefined,
        description: body['description'] ?? undefined,
        cigId: body['cigId'] ?? undefined,
      },
      caller.sub,
    );
  }
}
