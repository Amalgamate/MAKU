import { Module } from '@nestjs/common';

// Role management is handled via the UserRole enum and RolesGuard.
// A full custom-roles UI (M04) will be built in Phase 2.
// This module stub exists so AppModule can import it without errors.

@Module({})
export class RolesModule {}
