import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Landmark, Plus, X, TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import {
  useTransactionList, useLedgerSummary,
  useCreateTransaction, usePettyCashList,
  usePettyCashBalance, useCreatePettyCash,
} from '../hooks/useFinance';
import type { TransactionCategory } from '@maku/shared-types';

type Tab = 'ledger' | 'petty-cash';

// ─── Category labels ──────────────────────────────────────────────────────────
const CAT_LABELS: Record<TransactionCategory, string> = {
  livestock_commission: 'Livestock Commission',
  membership_fee:       'Membership Fee',
  share_capital:        'Share Capital',
  water_voucher:        'Water Voucher',
  donor_grant:          'Donor / Grant',
  other_income:         'Other Income',
  staff_salary:         'Staff Salary',
  operations:           'Operations',
  transport:            'Transport',
  marketing:            'Marketing',
  maintenance:          'Maintenance',
  office:               'Office',
  petty_cash:           'Petty Cash',
  other_expense:        'Other Expense',
};

const INCOME_CATS: TransactionCategory[] = [
  'livestock_commission','membership_fee','share_capital',
  'water_voucher','donor_grant','other_income',
];
const EXPENSE_CATS: TransactionCategory[] = [
  'staff_salary','operations','transport','marketing',
  'maintenance','office','petty_cash','other_expense',
];

// ─── Schemas ──────────────────────────────────────────────────────────────────
const txSchema = z.object({
  transactionDate: z.string().min(1),
  type:            z.enum(['income', 'expense']),
  category:        z.string().min(1),
  description:     z.string().min(3),
  amount:          z.coerce.number().min(0.01),
  paymentMethod:   z.string().optional(),
  referenceNumber: z.string().optional(),
  notes:           z.string().optional(),
});
type TxForm = z.infer<typeof txSchema>;

const pcSchema = z.object({
  entryDate:   z.string().min(1),
  action:      z.enum(['top_up', 'expense', 'reconcile']),
  description: z.string().min(3),
  amount:      z.coerce.number().min(0.01),
  receiptRef:  z.string().optional(),
});
type PcForm = z.infer<typeof pcSchema>;

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('ledger');
  const [showTxForm, setShowTxForm] = useState(false);
  const [showPcForm, setShowPcForm] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: txData, isLoading: txLoading } = useTransactionList({ ...filters, page: 1, perPage: 50 });
  const { data: summary } = useLedgerSummary();
  const { data: pcData } = usePettyCashList();
  const { data: pcBalance } = usePettyCashBalance();
  const createTx = useCreateTransaction();
  const createPc = useCreatePettyCash();

  const transactions = txData?.data ?? [];

  const txForm = useForm<TxForm>({
    resolver: zodResolver(txSchema),
    defaultValues: { transactionDate: new Date().toISOString().slice(0, 10), type: 'income', paymentMethod: 'cash' },
  });
  const watchedType = txForm.watch('type');

  const pcForm = useForm<PcForm>({
    resolver: zodResolver(pcSchema),
    defaultValues: { entryDate: new Date().toISOString().slice(0, 10), action: 'expense' },
  });

  function openTxForm(type: 'income' | 'expense') {
    setTxType(type);
    txForm.setValue('type', type);
    setShowTxForm(true);
  }

  function onTxSubmit(values: TxForm) {
    createTx.mutate(
      values as Parameters<typeof createTx.mutate>[0],
      { onSuccess: () => { txForm.reset(); setShowTxForm(false); } },
    );
  }

  function onPcSubmit(values: PcForm) {
    createPc.mutate(values, { onSuccess: () => { pcForm.reset(); setShowPcForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Finance</h1>
          <p className="text-sm text-gray-500">General ledger, income & expenses, petty cash float</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => openTxForm('expense')}>
            <ArrowDownRight size={14} className="text-red-500" /> Record Expense
          </Button>
          <Button size="sm" onClick={() => openTxForm('income')}>
            <ArrowUpRight size={14} /> Record Income
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income',    value: summary?.totalIncome,  icon: <TrendingUp size={18} className="text-green-600" />,  bg: 'bg-green-50',   fmt: true },
          { label: 'Total Expenses',  value: summary?.totalExpense, icon: <TrendingDown size={18} className="text-red-500" />,   bg: 'bg-red-50',     fmt: true },
          { label: 'Net Balance',     value: summary?.netBalance,   icon: <DollarSign size={18} className="text-brand-700" />,   bg: 'bg-brand-50',   fmt: true },
          { label: 'Petty Cash Float',value: pcBalance ?? 0,        icon: <Landmark size={18} className="text-amber-600" />,     bg: 'bg-amber-50',   fmt: true },
        ].map((k) => (
          <Card key={k.label} padding="sm" className="hover:shadow-md transition-shadow">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${k.bg}`}>{k.icon}</div>
            {k.value === undefined ? (
              <div className="h-8 flex items-center"><Spinner size="sm" /></div>
            ) : (
              <p className={`text-xl font-bold ${k.value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                KES {Math.abs(k.value).toLocaleString()}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Monthly trend chart */}
      {summary && summary.monthlyTrend.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Monthly Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={summary.monthlyTrend} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={(v: number) => [`KES ${v.toLocaleString()}`, '']}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="income"  stroke="#16a34a" fill="url(#incomeGrad)"  strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#expenseGrad)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([['ledger','General Ledger'],['petty-cash','Petty Cash Float']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === key ? 'border-brand-700 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Ledger tab ──────────────────────────────────────────────── */}
      {tab === 'ledger' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 focus:border-brand-600 focus:outline-none"
            >
              <option value="">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="date" onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700" />
            <input type="date" onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700" />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Date','Type','Category','Description','Amount (KES)','Method','Ref'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txLoading && <tr><td colSpan={7} className="py-10 text-center"><Spinner className="mx-auto" /></td></tr>}
                {!txLoading && transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Landmark size={28} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-400">No transactions yet</p>
                    </td>
                  </tr>
                )}
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(tx.transactionDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === 'income' ? 'green' : 'red'}>{tx.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{CAT_LABELS[tx.category as TransactionCategory] ?? tx.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{tx.description}</td>
                    <td className={`px-4 py-3 font-semibold ${tx.type === 'income' ? 'text-green-700' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 capitalize">{tx.paymentMethod}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{tx.referenceNumber ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Petty Cash tab ──────────────────────────────────────────── */}
      {tab === 'petty-cash' && (
        <>
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex items-center gap-3">
              <Landmark size={18} className="text-amber-600" />
              <div>
                <p className="text-xs text-amber-700 font-medium">Current Float</p>
                <p className="text-lg font-bold text-amber-900">KES {(pcBalance ?? 0).toLocaleString()}</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowPcForm(true)}>
              <Plus size={14} /> Add Entry
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Date','Action','Description','Amount (KES)','Balance After','Receipt Ref'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(pcData?.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-gray-400">No entries yet</td>
                  </tr>
                )}
                {(pcData?.data ?? []).map((e) => (
                  <tr key={e.id} className="hover:bg-warm-50">
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(e.entryDate)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.action === 'top_up' ? 'green' : e.action === 'reconcile' ? 'blue' : 'red'}>
                        {e.action.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{e.description}</td>
                    <td className={`px-4 py-3 font-semibold ${e.action === 'top_up' ? 'text-green-700' : 'text-red-600'}`}>
                      {e.action === 'top_up' ? '+' : e.action === 'expense' ? '-' : '='}{Number(e.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{Number(e.balanceAfter).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{e.receiptRef ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Transaction form modal ──────────────────────────────────── */}
      {showTxForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${txType === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {txType === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <h2 className="font-semibold text-gray-900">
                  Record {txType === 'income' ? 'Income' : 'Expense'}
                </h2>
              </div>
              <button onClick={() => { setShowTxForm(false); txForm.reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={txForm.handleSubmit(onTxSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Date" type="date" required error={txForm.formState.errors.transactionDate?.message} {...txForm.register('transactionDate')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select {...txForm.register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="">Select category</option>
                    {(watchedType === 'income' ? INCOME_CATS : EXPENSE_CATS).map((c) => (
                      <option key={c} value={c}>{CAT_LABELS[c]}</option>
                    ))}
                  </select>
                  {txForm.formState.errors.category && <p className="mt-1 text-xs text-red-600">{txForm.formState.errors.category.message}</p>}
                </div>
              </div>
              <Input label="Description" required error={txForm.formState.errors.description?.message} {...txForm.register('description')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Amount (KES)" type="number" min={0.01} step="0.01" required error={txForm.formState.errors.amount?.message} {...txForm.register('amount')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                  <select {...txForm.register('paymentMethod')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <Input label="Reference number" hint="Optional — M-Pesa code, cheque no." {...txForm.register('referenceNumber')} />
              <Input label="Notes" hint="Optional" {...txForm.register('notes')} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createTx.isPending} className="flex-1">Save Transaction</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowTxForm(false); txForm.reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Petty Cash form modal ───────────────────────────────────── */}
      {showPcForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><Landmark size={16} /></div>
                <h2 className="font-semibold text-gray-900">Petty Cash Entry</h2>
              </div>
              <button onClick={() => { setShowPcForm(false); pcForm.reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={pcForm.handleSubmit(onPcSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Date" type="date" required error={pcForm.formState.errors.entryDate?.message} {...pcForm.register('entryDate')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action <span className="text-red-500">*</span></label>
                  <select {...pcForm.register('action')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="expense">Expense — deduct from float</option>
                    <option value="top_up">Top-up — add to float</option>
                    <option value="reconcile">Reconcile — set balance to amount</option>
                  </select>
                </div>
              </div>
              <Input label="Description" required error={pcForm.formState.errors.description?.message} {...pcForm.register('description')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Amount (KES)" type="number" min={0.01} step="0.01" required error={pcForm.formState.errors.amount?.message} {...pcForm.register('amount')} />
                <Input label="Receipt / reference" hint="Optional" {...pcForm.register('receiptRef')} />
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
                Current float: <strong>KES {(pcBalance ?? 0).toLocaleString()}</strong>
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createPc.isPending} className="flex-1">Save Entry</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowPcForm(false); pcForm.reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
