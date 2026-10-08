import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
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
import type { Response } from 'express';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberFilterDto } from './dto/member-filter.dto';
import { RejectMemberDto } from './dto/reject-member.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

// ─── CSV parser (inline — no extra dep needed) ───────────────────────────────

function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = (lines[0] ?? '').split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(
      headers.map((h, i) => [h, (values[i] ?? '').trim()]),
    );
  });
}

// ─── Controller ──────────────────────────────────────────────────────────────

@ApiTags('Members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(private readonly svc: MembersService) {}

  // POST /v1/members — admin creates a member directly
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Create a member (admin/field officer)' })
  async create(@Body() dto: CreateMemberDto) {
    const m = await this.svc.create(dto, false);
    return this.svc.toDto(m);
  }

  // POST /v1/members/self-register — public (no auth)
  @Public()
  @Post('self-register')
  @ApiOperation({ summary: 'Member self-registration (public)' })
  async selfRegister(@Body() dto: CreateMemberDto) {
    const m = await this.svc.create(dto, true);
    return { id: m.id, message: 'Registration received. Pending approval.' };
  }

  // GET /v1/members
  @Get()
  @ApiOperation({ summary: 'List members with pagination and filters' })
  async findAll(@Query() filters: MemberFilterDto) {
    const { data, total } = await this.svc.findAll(filters);
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 25;
    return {
      data: data.map((m) => this.svc.toDto(m)),
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  // GET /v1/members/pending
  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'List pending member registrations awaiting approval' })
  async findPending() {
    const members = await this.svc.findPending();
    return members.map((m) => this.svc.toDto(m));
  }

  // GET /v1/members/export
  @Get('export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export member list as CSV' })
  async exportCsv(@Query() filters: MemberFilterDto, @Res() res: Response) {
    const members = await this.svc.exportAll(filters);

    const header = [
      'memberNumber', 'fullName', 'nationalId', 'gender', 'dateOfBirth',
      'phonePrimary', 'phoneSecondary', 'subLocation', 'village',
      'status', 'registrationDate', 'cattleCount', 'goatCount',
      'camelCount', 'sheepCount', 'shareContributions',
    ].join(',');

    const rows = members.map((m) =>
      [
        m.memberNumber ?? '',
        `"${m.fullName}"`,
        m.nationalId,
        m.gender ?? '',
        m.dateOfBirth ?? '',
        m.phonePrimary,
        m.phoneSecondary ?? '',
        m.subLocation ?? '',
        m.village ?? '',
        m.status,
        m.registrationDate,
        m.cattleCount,
        m.goatCount,
        m.camelCount,
        m.sheepCount,
        m.shareContributions,
      ].join(','),
    );

    const csv = [header, ...rows].join('\n');
    const filename = `maku-members-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  // GET /v1/members/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a single member by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const m = await this.svc.findById(id);
    return this.svc.toDto(m);
  }

  // PATCH /v1/members/:id
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update member details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    const m = await this.svc.update(id, dto);
    return this.svc.toDto(m);
  }

  // POST /v1/members/:id/approve
  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve a pending member — assigns member number' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() caller: JwtPayload,
  ) {
    const m = await this.svc.approve(id, caller.sub);
    return this.svc.toDto(m);
  }

  // POST /v1/members/:id/reject
  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject a pending member with a reason' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectMemberDto,
  ) {
    const m = await this.svc.reject(id, dto);
    return this.svc.toDto(m);
  }

  // POST /v1/members/:id/photo
  @Post(':id/photo')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @UseInterceptors(FileInterceptor('photo', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { photo: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload member photo (max 5 MB)' })
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO Phase 3: stream to MinIO and return the public URL.
    // For now store a placeholder — real upload wired when MinIO service is added.
    const photoUrl = `/uploads/members/${id}/${file.originalname}`;
    const m = await this.svc.updatePhoto(id, photoUrl);
    return { photoUrl: m.photoUrl };
  }

  // POST /v1/members/import
  @Post('import')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Bulk import members from CSV file' })
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    const raw = file.buffer.toString('utf-8');
    const rows = parseCsv(raw);
    return this.svc.importCsv(rows);
  }

  // DELETE /v1/members/:id — soft deactivate
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a member (soft delete)' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const m = await this.svc.deactivate(id);
    return this.svc.toDto(m);
  }
}
