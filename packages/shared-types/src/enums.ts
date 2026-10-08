// ─── User & Auth ────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FINANCE_OFFICER = 'finance_officer',
  FIELD_OFFICER = 'field_officer',
  CIG_COORDINATOR = 'cig_coordinator',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

// ─── Member ─────────────────────────────────────────────────────────────────

export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DECEASED = 'deceased',
  PENDING = 'pending',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum CigRole {
  MEMBER = 'member',
  CHAIRPERSON = 'chairperson',
  SECRETARY = 'secretary',
  TREASURER = 'treasurer',
}

export enum CigType {
  COMMODITY = 'commodity',
  GEOGRAPHY = 'geography',
  MIXED = 'mixed',
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}
