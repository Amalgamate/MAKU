import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';
import type { User } from '../users/user.entity';
import type { JwtPayload } from './types/jwt-payload.type';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import { UserStatus } from '@maku/shared-types';

const BCRYPT_ROUNDS = 12;
const OTP_TTL_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  // ─── Validate credentials (used by LocalStrategy) ─────────────────────────

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== UserStatus.ACTIVE) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    return match ? user : null;
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  async login(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    await this.usersService.updateLastLogin(user.id);

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn') ?? '15m',
    });

    const refreshToken = await this.issueRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  // ─── Refresh ───────────────────────────────────────────────────────────────

  async refresh(rawToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokenRepo.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!stored.user || stored.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Rotate: revoke old, issue new
    await this.refreshTokenRepo.update(stored.id, { revokedAt: new Date() });

    const payload: JwtPayload = {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn') ?? '15m',
    });

    const newRefreshToken = await this.issueRefreshToken(stored.user.id);
    return { accessToken, refreshToken: newRefreshToken };
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenRepo.update({ tokenHash }, { revokedAt: new Date() });
  }

  // ─── Forgot password ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ resetToken: string }> {
    let user = null;
    if (dto.email) user = await this.usersService.findByEmail(dto.email);
    else if (dto.phone) user = await this.usersService.findByPhone(dto.phone);

    // Always return success to prevent user enumeration
    if (!user || user.status !== UserStatus.ACTIVE) {
      return { resetToken: randomBytes(32).toString('hex') };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpHash = await bcrypt.hash(otp, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    const resetToken = randomBytes(32).toString('hex');

    await this.usersService.saveResetOtp(user.id, otpHash, expiresAt);

    // TODO: send OTP via SMS (Africa's Talking) and/or email (SendGrid)
    // For now log to console in development only
    if (this.config.get('app.nodeEnv') === 'development') {
      console.warn(`[DEV] Password reset OTP for ${user.email}: ${otp}`);
    }

    return { resetToken };
  }

  // ─── Reset password ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // Find user with a non-expired OTP
    const users = await this.refreshTokenRepo.manager
      .getRepository('users')
      .createQueryBuilder('u')
      .where('u.reset_otp_hash IS NOT NULL')
      .andWhere('u.reset_otp_expires_at > NOW()')
      .getMany() as User[];

    let targetUser: User | null = null;
    for (const u of users) {
      if (u.resetOtpHash && await bcrypt.compare(dto.otp, u.resetOtpHash)) {
        targetUser = u;
        break;
      }
    }

    if (!targetUser) throw new BadRequestException('Invalid or expired OTP');

    await this.usersService.updatePassword(targetUser.id, dto.newPassword);
    await this.usersService.clearResetOtp(targetUser.id);
    // Revoke all refresh tokens for this user on password change
    await this.refreshTokenRepo.update(
      { userId: targetUser.id },
      { revokedAt: new Date() },
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async issueRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(raw);
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const days = parseInt(refreshExpiresIn.replace('d', ''), 10);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const token = this.refreshTokenRepo.create({ userId, tokenHash, expiresAt });
    await this.refreshTokenRepo.save(token);
    return raw;
  }

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
