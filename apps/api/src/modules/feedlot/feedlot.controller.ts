import {
  Body, Controller, Get, Param, ParseUUIDPipe,
  Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedlotService } from './feedlot.service';
import { CreateFeedlotDto, UpdateFeedlotDto } from './dto/create-feedlot.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('Feedlot')
@ApiBearerAuth()
@Controller('feedlot')
export class FeedlotController {
  constructor(private readonly svc: FeedlotService) {}

  // GET /v1/feedlot
  @Get()
  @ApiOperation({ summary: 'List feedlot animals with optional filters' })
  async findAll(
    @Query('status') status?: string,
    @Query('memberId') memberId?: string,
  ) {
    return this.svc.findAll({ status, memberId });
  }

  // POST /v1/feedlot
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Add an animal to the feedlot' })
  async create(@Body() dto: CreateFeedlotDto) {
    return this.svc.create(dto);
  }

  // PATCH /v1/feedlot/:id
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FIELD_OFFICER)
  @ApiOperation({ summary: 'Update a feedlot animal record' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedlotDto,
  ) {
    return this.svc.update(id, dto);
  }
}
