// ─── Date helpers ────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

// ─── Number helpers ──────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-KE').format(n);
}

// ─── String helpers ──────────────────────────────────────────────────────────

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── URL / query string ──────────────────────────────────────────────────────

export function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// ─── Validation helpers ──────────────────────────────────────────────────────

export function isValidKenyanPhone(phone: string): boolean {
  // Matches +2547XXXXXXXX or 07XXXXXXXX or 2547XXXXXXXX
  return /^(\+?254|0)7\d{8}$/.test(phone.replace(/\s/g, ''));
}

export function isValidNationalId(id: string): boolean {
  // Kenya national ID: 7-8 digits
  return /^\d{7,8}$/.test(id.trim());
}
