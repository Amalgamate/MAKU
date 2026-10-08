import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto, UpdateUserRoleDto } from './dto/update-user.dto';
import { UserStatus } from '@maku/shared-types';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.repo.create({
      ...dto,
      passwordHash,
      status: UserStatus.ACTIVE,
    });
    return this.repo.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({ where: { phone } });
  }

  async findAll(page = 1, perPage = 25): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });
    return { data, total };
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async updateRoleStatus(id: string, dto: UpdateUserRoleDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.status !== undefined) user.status = dto.status;
    return this.repo.save(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.repo.update(id, { passwordHash: hash });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repo.update(id, { lastLoginAt: new Date() });
  }

  async saveResetOtp(id: string, otpHash: string, expiresAt: Date): Promise<void> {
    await this.repo.update(id, {
      resetOtpHash: otpHash,
      resetOtpExpiresAt: expiresAt,
    });
  }

  async clearResetOtp(id: string): Promise<void> {
    await this.repo.update(id, { resetOtpHash: null, resetOtpExpiresAt: null });
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findById(id);
    user.status = UserStatus.DEACTIVATED;
    return this.repo.save(user);
  }

  toProfile(user: User) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
