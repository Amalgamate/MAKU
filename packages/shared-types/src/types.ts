import type {
  UserRole,
  UserStatus,
  MemberStatus,
  Gender,
  CigRole,
  CigType,
  AuditAction,
} from './enums';

// ─── API envelope ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
  path: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  token: string;
  otp: string;
  newPassword: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Members ─────────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  memberNumber: string | null;
  fullName: string;
  nationalId: string;
  dateOfBirth: string | null;
  gender: Gender | null;
  phonePrimary: string;
  phoneSecondary: string | null;
  subLocation: string | null;
  village: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  photoUrl: string | null;
  status: MemberStatus;
  registrationDate: string;
  shareContributions: number;
  cattleCount: number;
  goatCount: number;
  camelCount: number;
  sheepCount: number;
  // next of kin
  nextOfKinName: string | null;
  nextOfKinRelationship: string | null;
  nextOfKinPhone: string | null;
  // contributions
  membershipFeePaid: number;
  shareCapitalPaid: number;
  notes: string | null;
  cigs: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberRequest {
  fullName: string;
  nationalId: string;
  dateOfBirth?: string;
  gender?: Gender;
  phonePrimary: string;
  phoneSecondary?: string;
  subLocation?: string;
  village?: string;
  gpsLat?: number;
  gpsLng?: number;
  shareContributions?: number;
  cattleCount?: number;
  goatCount?: number;
  camelCount?: number;
  sheepCount?: number;
  notes?: string;
  // next of kin
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  // contributions
  membershipFeePaid?: number;
  shareCapitalPaid?: number;
  cigIds?: string[];
}

export interface MemberListFilters {
  search?: string;
  status?: MemberStatus;
  gender?: Gender;
  cigId?: string;
  year?: number;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── CIGs ────────────────────────────────────────────────────────────────────

export interface Cig {
  id: string;
  name: string;
  type: CigType;
  registrationDate: string | null;
  subLocation: string | null;
  chairpersonMemberId: string | null;
  secretaryMemberId: string | null;
  treasurerMemberId: string | null;
  memberCount: number;
  createdAt: string;
}

export interface CigDetail extends Cig {
  members: Array<{
    id: string;
    memberNumber: string | null;
    fullName: string;
    phonePrimary: string;
    subLocation: string | null;
    status: MemberStatus;
    photoUrl: string | null;
  }>;
}

export interface CigMeeting {
  id: string;
  cigId: string;
  date: string;
  agenda: string;
  minutes: string | null;
  actionItems: string | null;
  attendanceCount: number;
  venue: string | null;
  recordedBy: string | null;
  createdAt: string;
}

export interface CigDocument {
  id: string;
  cigId: string;
  name: string;
  category: string;
  year: number | null;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface CreateCigRequest {
  name: string;
  type?: CigType;
  registrationDate?: string;
  subLocation?: string;
  chairpersonMemberId?: string;
  secretaryMemberId?: string;
  treasurerMemberId?: string;
}

export interface CreateMeetingRequest {
  date: string;
  agenda: string;
  minutes?: string;
  actionItems?: string;
  attendanceCount?: number;
  venue?: string;
}

// ─── Livestock ───────────────────────────────────────────────────────────────

export type LivestockSpecies = 'cattle' | 'goat' | 'camel' | 'sheep' | 'chicken' | 'other';
export type LivestockStatus  = 'pending' | 'completed' | 'cancelled';

export interface LivestockTransaction {
  id: string;
  marketDate: string;
  marketLocation: string | null;
  sellerMemberId: string;
  buyerName: string;
  buyerPhone: string | null;
  species: LivestockSpecies;
  quantity: number;
  totalWeightKg: number | null;
  pricePerUnit: number;
  totalAmount: number;
  makuCommission: number;
  memberProceeds: number;
  paymentMethod: string;
  mpesaReference: string | null;
  paymentConfirmed: boolean;
  status: LivestockStatus;
  cigId: string | null;
  recordedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateLivestockTransactionRequest {
  marketDate: string;
  marketLocation?: string;
  sellerMemberId: string;
  buyerName: string;
  buyerPhone?: string;
  species: LivestockSpecies;
  quantity: number;
  totalWeightKg?: number;
  pricePerUnit: number;
  makuCommission?: number;
  paymentMethod?: string;
  mpesaReference?: string;
  cigId?: string;
  notes?: string;
}

export interface LivestockSummary {
  totalTransactions: number;
  totalAnimals: number;
  totalValue: number;
  totalCommission: number;
  totalProceeds: number;
  bySpecies: Record<string, { count: number; animals: number; value: number }>;
}

// ─── Water Vouchers ──────────────────────────────────────────────────────────

export type VoucherStatus = 'issued' | 'used' | 'expired' | 'cancelled';

export interface WaterVoucher {
  id: string;
  voucherNumber: string;
  memberId: string;
  litresAllocated: number;
  litresUsed: number;
  boreholeName: string | null;
  costPerLitre: number;
  totalCost: number;
  issueDate: string;
  expiryDate: string | null;
  usedDate: string | null;
  status: VoucherStatus;
  cigId: string | null;
  issuedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateWaterVoucherRequest {
  memberId: string;
  litresAllocated: number;
  boreholeName?: string;
  costPerLitre?: number;
  issueDate: string;
  expiryDate?: string;
  cigId?: string;
  notes?: string;
}

export interface WaterVoucherSummary {
  totalIssued: number;
  totalLitresAllocated: number;
  totalLitresUsed: number;
  totalCost: number;
  byStatus: { issued: number; used: number; expired: number; cancelled: number };
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────────────

export interface DashboardKpis {
  members: {
    total: number;
    active: number;
    pending: number;
    cigs: number;
  };
  livestock: {
    thisMonth: { transactions: number; animals: number; value: number };
    allTime: { animals: number; value: number };
    bySpecies: Array<{ species: string; animals: number; value: number }>;
  };
  waterVouchers: {
    thisMonth: { issued: number; litres: number };
  };
  finance: {
    thisMonth: { income: number; expense: number; net: number };
  };
  memberGrowth: Array<{ month: string; count: number }>;
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'livestock_commission' | 'membership_fee' | 'share_capital'
  | 'water_voucher' | 'donor_grant' | 'other_income'
  | 'staff_salary' | 'operations' | 'transport' | 'marketing'
  | 'maintenance' | 'office' | 'petty_cash' | 'other_expense';

export type PaymentMethod = 'cash' | 'mpesa' | 'bank_transfer' | 'cheque';

export interface FinanceTransaction {
  id: string;
  transactionDate: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  memberId: string | null;
  livestockTransactionId: string | null;
  voucherId: string | null;
  recordedBy: string | null;
  approvedBy: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateFinanceTransactionRequest {
  transactionDate: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string;
  memberId?: string;
  livestockTransactionId?: string;
  voucherId?: string;
  notes?: string;
}

export type PettyCashAction = 'top_up' | 'expense' | 'reconcile';

export interface PettyCashEntry {
  id: string;
  entryDate: string;
  action: PettyCashAction;
  description: string;
  amount: number;
  balanceAfter: number;
  receiptRef: string | null;
  recordedBy: string | null;
  createdAt: string;
}

export interface CreatePettyCashRequest {
  entryDate: string;
  action: PettyCashAction;
  description: string;
  amount: number;
  receiptRef?: string;
}

export interface LedgerSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  byCategory: Record<string, { income: number; expense: number }>;
  monthlyTrend: Array<{ month: string; income: number; expense: number }>;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userId: string;
  userFullName: string;
  ipAddress: string;
  createdAt: string;
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export type SupplierCategory = 'livestock' | 'feed' | 'veterinary' | 'equipment' | 'transport' | 'services' | 'other';

export interface Supplier {
  id: string; name: string; category: SupplierCategory;
  contactName: string | null; phone: string | null; email: string | null;
  physicalAddress: string | null; kraPin: string | null;
  bankName: string | null; bankAccount: string | null; mpesaNumber: string | null;
  isActive: boolean; rating: number; notes: string | null; createdAt: string;
}

export interface CreateSupplierRequest {
  name: string; category?: SupplierCategory; contactName?: string;
  phone?: string; email?: string; physicalAddress?: string;
  kraPin?: string; bankName?: string; bankAccount?: string;
  mpesaNumber?: string; notes?: string;
}

// ─── Purchases & Sales ───────────────────────────────────────────────────────

export type PurchaseType   = 'purchase' | 'sale';
export type PurchaseStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';
export interface LineItem { item: string; qty: number; unitPrice: number; total: number; }

export interface PurchaseTransaction {
  id: string; referenceNumber: string; transactionDate: string;
  type: PurchaseType; status: PurchaseStatus;
  supplierId: string | null; buyerName: string | null; memberId: string | null;
  description: string; lineItems: LineItem[];
  subtotal: number; taxAmount: number; totalAmount: number; amountPaid: number;
  paymentMethod: string | null; paymentReference: string | null;
  dueDate: string | null; recordedBy: string | null; notes: string | null; createdAt: string;
}

export interface CreatePurchaseRequest {
  transactionDate: string; type: PurchaseType; description: string;
  lineItems: LineItem[]; supplierId?: string; buyerName?: string;
  memberId?: string; taxAmount?: number; paymentMethod?: string;
  paymentReference?: string; dueDate?: string; notes?: string;
}

// ─── Procurement ─────────────────────────────────────────────────────────────

export type ProcurementStatus = 'requisition' | 'quoting' | 'approved' | 'ordered' | 'received' | 'cancelled';

export interface ProcurementOrder {
  id: string; poNumber: string; title: string; description: string;
  requisitionDate: string; status: ProcurementStatus;
  supplierId: string | null; budgetAmount: number; actualAmount: number | null;
  requiresQuotes: boolean; quotes: Array<{ supplier: string; amount: number; notes?: string }>;
  requestedBy: string | null; approvedBy: string | null;
  approvedDate: string | null; expectedDelivery: string | null;
  deliveryDate: string | null; notes: string | null; createdAt: string;
}

export interface CreateProcurementRequest {
  title: string; description: string; requisitionDate: string;
  budgetAmount: number; supplierId?: string; requiresQuotes?: boolean;
  expectedDelivery?: string; notes?: string;
}
