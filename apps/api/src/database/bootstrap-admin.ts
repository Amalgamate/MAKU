import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User } from '../modules/users/user.entity';
import { UserRole, UserStatus } from '@maku/shared-types';

const ADMIN_EMAIL = 'admin@maku.coop';

async function bootstrapAdmin() {
  const password = process.env['MAKU_ADMIN_BOOTSTRAP_PASSWORD'];
  if (!password || password.length < 12) {
    throw new Error('MAKU_ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters.');
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const users = app.get(DataSource).getRepository(User);
    const existing = await users.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log(`Bootstrap skipped: ${ADMIN_EMAIL} already exists; no account data changed.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await users.insert({
      email: ADMIN_EMAIL,
      phone: '+254700000000',
      fullName: 'MAKU Administrator',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      avatarUrl: null,
      lastLoginAt: null,
      resetOtpHash: null,
      resetOtpExpiresAt: null,
      memberId: null,
    });
    console.log(`Bootstrap created active super-admin account ${ADMIN_EMAIL}.`);
  } finally {
    await app.close();
  }
}

bootstrapAdmin().catch((error: unknown) => {
  console.error('Failed to bootstrap MAKU administrator:', error);
  process.exitCode = 1;
});
