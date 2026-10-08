import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { SmsLog, SmsStatus } from './sms-log.entity';
import type { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectRepository(SmsLog)
    private readonly repo: Repository<SmsLog>,
  ) {}

  async sendSms(dto: SendSmsDto, userId: string): Promise<SmsLog> {
    const log = this.repo.create({
      message: dto.message,
      recipient: dto.recipient ?? null,
      memberCount: dto.memberCount ?? null,
      sentBy: userId,
      status: SmsStatus.PENDING,
    });

    const saved = await this.repo.save(log);

    const apiKey  = process.env['AT_API_KEY'];
    const username = process.env['AT_USERNAME'];

    if (apiKey && username) {
      try {
        // Dynamic import to avoid hard dependency; will resolve if africastalking is installed
        const AfricasTalking = await import('africastalking' as string) as unknown as (opts: Record<string, string>) => { SMS: { send: (p: Record<string, unknown>) => Promise<unknown> } };
        const at = AfricasTalking({ apiKey, username });
        await at.SMS.send({
          to: [saved.recipient ?? ''],
          message: saved.message,
          from: username,
        });
        saved.status = SmsStatus.SENT;
        saved.sentAt = new Date();
      } catch (err: unknown) {
        saved.status = SmsStatus.FAILED;
        saved.errorMessage = err instanceof Error ? err.message : String(err);
      }
    } else {
      // No credentials — mark as failed (not configured)
      saved.status = SmsStatus.FAILED;
      saved.errorMessage = 'AT_API_KEY or AT_USERNAME not configured';
    }

    return this.repo.save(saved);
  }

  async getLogs(): Promise<SmsLog[]> {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 100 });
  }
}
