import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags,
} from '@nestjs/swagger';
import { CigsService } from './cigs.service';
import { CreateCigDto } from './dto/create-cig.dto';
import { UpdateCigDto } from './dto/update-cig.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { CreateCigDocumentDto } from './dto/create-document.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

@ApiTags('CIGs')
@ApiBearerAuth()
@Controller('cigs')
export class CigsController {
  constructor(private readonly svc: CigsService) {}

  // POST /v1/cigs
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @ApiOperation({ summary: 'Create a new CIG' })
  async create(@Body() dto: CreateCigDto) {
    const cig = await this.svc.create(dto);
    return this.svc.toDto(cig);
  }

  // GET /v1/cigs
  @Get()
  @ApiOperation({ summary: 'List all CIGs (with optional search)' })
  async findAll(@Query('search') search?: string) {
    const cigs = await this.svc.findAll(search);
    return cigs.map((c) => this.svc.toDto(c));
  }

  // GET /v1/cigs/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get a CIG by ID with member list' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const cig = await this.svc.findById(id);
    return {
      ...this.svc.toDto(cig),
      members: (cig.members ?? []).map((m) => ({
        id: m.id,
        memberNumber: m.memberNumber,
        fullName: m.fullName,
        phonePrimary: m.phonePrimary,
        subLocation: m.subLocation,
        status: m.status,
        photoUrl: m.photoUrl,
      })),
    };
  }

  // PATCH /v1/cigs/:id
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @ApiOperation({ summary: 'Update CIG details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCigDto,
  ) {
    const cig = await this.svc.update(id, dto);
    return this.svc.toDto(cig);
  }

  // DELETE /v1/cigs/:id
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a CIG' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.svc.remove(id);
  }

  // ─── Membership ───────────────────────────────────────────────────────────

  // POST /v1/cigs/:id/members/:memberId
  @Post(':id/members/:memberId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Add a member to this CIG' })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    const cig = await this.svc.addMember(id, memberId);
    return this.svc.toDto(cig);
  }

  // DELETE /v1/cigs/:id/members/:memberId
  @Delete(':id/members/:memberId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @ApiOperation({ summary: 'Remove a member from this CIG' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    const cig = await this.svc.removeMember(id, memberId);
    return this.svc.toDto(cig);
  }

  // GET /v1/cigs/:id/members
  @Get(':id/members')
  @ApiOperation({ summary: 'List members of a CIG' })
  async getMembers(@Param('id', ParseUUIDPipe) id: string) {
    const members = await this.svc.getMembers(id);
    return members.map((m) => ({
      id: m.id,
      memberNumber: m.memberNumber,
      fullName: m.fullName,
      phonePrimary: m.phonePrimary,
      subLocation: m.subLocation,
      status: m.status,
      photoUrl: m.photoUrl,
    }));
  }

  // ─── Meetings ─────────────────────────────────────────────────────────────

  // POST /v1/cigs/:id/meetings
  @Post(':id/meetings')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Record a CIG meeting' })
  async createMeeting(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMeetingDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const meeting = await this.svc.createMeeting(id, dto, caller.sub);
    return this.svc.meetingToDto(meeting);
  }

  // GET /v1/cigs/:id/meetings
  @Get(':id/meetings')
  @ApiOperation({ summary: 'List meetings for a CIG' })
  async getMeetings(@Param('id', ParseUUIDPipe) id: string) {
    const meetings = await this.svc.getMeetings(id);
    return meetings.map((m) => this.svc.meetingToDto(m));
  }

  // PATCH /v1/cigs/:id/meetings/:meetingId
  @Patch(':id/meetings/:meetingId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @ApiOperation({ summary: 'Update a meeting record' })
  async updateMeeting(
    @Param('meetingId', ParseUUIDPipe) meetingId: string,
    @Body() dto: CreateMeetingDto,
  ) {
    const meeting = await this.svc.updateMeeting(meetingId, dto);
    return this.svc.meetingToDto(meeting);
  }

  // DELETE /v1/cigs/:id/meetings/:meetingId
  @Delete(':id/meetings/:meetingId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a meeting record' })
  async deleteMeeting(@Param('meetingId', ParseUUIDPipe) meetingId: string) {
    await this.svc.deleteMeeting(meetingId);
  }

  // ─── Documents ────────────────────────────────────────────────────────────

  // POST /v1/cigs/:id/documents
  @Post(':id/documents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        category: { type: 'string' },
        year: { type: 'integer' },
        description: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a document for this CIG (max 10 MB)' })
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCigDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() caller: JwtPayload,
  ) {
    // Phase 3: stream to MinIO. For now, store locally.
    const fileUrl = `/uploads/cigs/${id}/${file.originalname}`;
    const doc = await this.svc.createDocument(
      id, dto, fileUrl, file.size, file.mimetype, caller.sub,
    );
    return this.svc.docToDto(doc);
  }

  // GET /v1/cigs/:id/documents
  @Get(':id/documents')
  @ApiOperation({ summary: 'List documents for a CIG' })
  async getDocuments(@Param('id', ParseUUIDPipe) id: string) {
    const docs = await this.svc.getDocuments(id);
    return docs.map((d) => this.svc.docToDto(d));
  }

  // DELETE /v1/cigs/:id/documents/:docId
  @Delete(':id/documents/:docId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CIG_COORDINATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a CIG document' })
  async deleteDocument(@Param('docId', ParseUUIDPipe) docId: string) {
    await this.svc.deleteDocument(docId);
  }
}
