import {
  Body, Controller, Get, Param, ParseUUIDPipe, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFinanceTransactionDto } from './dto/create-transaction.dto';
import { CreatePettyCashDto } from './dto/create-petty-cash.dto';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '@maku/shared-types';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly svc: FinanceService) {}

  // ─── General Ledger ───────────────────────────────────────────────────────

  @Post('transactions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Record an income or expense transaction' })
  async createTransaction(
    @Body() dto: CreateFinanceTransactionDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const tx = await this.svc.createTransaction(dto, caller.sub);
    return this.svc.txToDto(tx);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions with filters' })
  async listTransactions(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('memberId') memberId?: string,
    @Query('page') page = '1',
    @Query('perPage') perPage = '25',
  ) {
    const { data, total } = await this.svc.findTransactions({
      type, category, from, to, memberId,
      page: parseInt(page, 10), perPage: parseInt(perPage, 10),
    });
    const p = parseInt(page, 10), pp = parseInt(perPage, 10);
    return {
      data: data.map((t) => this.svc.txToDto(t)),
      meta: { page: p, perPage: pp, total, totalPages: Math.ceil(total / pp) },
    };
  }

  @Get('transactions/summary')
  @ApiOperation({ summary: 'Get ledger summary — income vs expense, by category, monthly trend' })
  async summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.svc.getLedgerSummary(from, to);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get a single transaction' })
  async getTransaction(@Param('id', ParseUUIDPipe) id: string) {
    const tx = await this.svc.findTransactionById(id);
    return this.svc.txToDto(tx);
  }

  // ─── Petty Cash ───────────────────────────────────────────────────────────

  @Post('petty-cash')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE_OFFICER)
  @ApiOperation({ summary: 'Add a petty cash entry (top-up, expense, or reconcile)' })
  async createPettyCash(
    @Body() dto: CreatePettyCashDto,
    @CurrentUser() caller: JwtPayload,
  ) {
    const entry = await this.svc.createPettyCashEntry(dto, caller.sub);
    return this.svc.pcToDto(entry);
  }

  @Get('petty-cash')
  @ApiOperation({ summary: 'List petty cash entries' })
  async listPettyCash(@Query('page') page = '1', @Query('perPage') perPage = '25') {
    const { data, total } = await this.svc.getPettyCashEntries(
      parseInt(page, 10), parseInt(perPage, 10),
    );
    return {
      data: data.map((e) => this.svc.pcToDto(e)),
      meta: { page: parseInt(page, 10), perPage: parseInt(perPage, 10), total },
    };
  }

  @Get('petty-cash/balance')
  @ApiOperation({ summary: 'Get current petty cash balance' })
  async pettyCashBalance() {
    const balance = await this.svc.getPettyCashBalance();
    return { balance };
  }
}
