import type { UserRole } from '@maku/shared-types';

export interface JwtPayload {
  sub: string;      // user UUID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
