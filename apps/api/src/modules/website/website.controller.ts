import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebsiteService } from './website.service';
import type { Block, WebsitePage } from './website.entity';
import { Roles } from '../../shared/decorators/roles.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { UserRole } from '@maku/shared-types';

@ApiTags('Website')
@Controller('website')
export class WebsiteController {
  constructor(private readonly svc: WebsiteService) {}

  // ── Public endpoints (read-only, used by the public site) ─────────────────

  @Public()
  @Get('settings')
  @ApiOperation({ summary: 'Get full website settings (public)' })
  async getSettings() { return this.svc.getSettings(); }

  @Public()
  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get a single page by slug (public)' })
  async getPage(@Param('slug') slug: string) { return this.svc.getPage(slug); }

  // ── Admin endpoints ────────────────────────────────────────────────────────

  @Patch('settings')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update website global settings' })
  async updateSettings(@Body() body: Record<string, unknown>) {
    return this.svc.updateSettings(body as never);
  }

  @Post('pages')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new page' })
  async addPage(@Body() body: Omit<WebsitePage, 'id'>) {
    return this.svc.addPage(body);
  }

  @Patch('pages/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a page (title, slug, nav, SEO, etc.)' })
  async updatePage(
    @Param('id') id: string,
    @Body() body: Partial<WebsitePage>,
  ) {
    return this.svc.updatePage(id, body);
  }

  @Delete('pages/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a page' })
  async deletePage(@Param('id') id: string) {
    return this.svc.deletePage(id);
  }

  @Put('pages/:id/blocks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Replace all blocks on a page (full reorder/save)' })
  async updateBlocks(
    @Param('id') id: string,
    @Body() body: { blocks: Block[] },
  ) {
    return this.svc.updateBlocks(id, body.blocks);
  }

  @Post('pages/:id/blocks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Append a block to a page' })
  async addBlock(
    @Param('id') id: string,
    @Body() block: Block,
  ) {
    return this.svc.addBlock(id, block);
  }

  @Post('publish')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish the website (mark as live)' })
  async publish() { return this.svc.publish(); }
}
