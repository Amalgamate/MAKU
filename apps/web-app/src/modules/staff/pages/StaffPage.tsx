import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCog, Plus, X, Phone, Mail } from 'lucide-react';
import { Button, Input, Card, Badge, Spinner } from '@maku/ui';
import { formatDate, formatCurrency } from '@maku/utils';
import { useStaffList, useCreateStaff } from '../hooks/useStaff';

const schema = z.object({
  fullName: z.string().min(2), role: z.string().min(2),
  hireDate: z.string().min(1), department: z.string().optional(),
  phone: z.string().optional(), email: z.string().optional(),
  employmentType: z.string().optional(), nationalId: z.string().optional(),
  basicSalary: z.coerce.number().min(0).optional(),
  nhifNumber: z.string().optional(), nssfNumber: z.string().optional(),
  kraPin: z.string().optional(), bankName: z.string().optional(),
  bankAccount: z.string().optional(), mpesaNumber: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'gray'> = { active: 'green', on_leave: 'yellow', terminated: 'gray' };
const EMP_TYPE_LABEL: Record<string, string> = { permanent: 'Permanent', contract: 'Contract', casual: 'Casual' };

export default function StaffPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: staff = [], isLoading } = useStaffList();
  const createMutation = useCreateStaff();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { hireDate: new Date().toISOString().slice(0, 10), employmentType: 'permanent' },
  });

  function onSubmit(v: Form) {
    const clean = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val === '' ? undefined : val])) as Form;
    createMutation.mutate(clean as Parameters<typeof createMutation.mutate>[0], { onSuccess: () => { reset(); setShowForm(false); } });
  }

  return (
    <div className="page-container space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-heading">Staff Management</h1>
          <p className="text-sm text-gray-500">{staff.length} active staff member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add Staff</Button>
      </div>

      {isLoading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>{['Staff No.', 'Name', 'Role', 'Department', 'Type', 'Salary (KES)', 'Status', 'Hire Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center">
                  <UserCog size={28} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">No staff registered yet</p>
                </td></tr>
              )}
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-warm-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-brand-700">{s.staffNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.fullName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {s.phone && <span className="flex items-center gap-1 text-[10px] text-gray-400"><Phone size={9}/>{s.phone}</span>}
                      {s.email && <span className="flex items-center gap-1 text-[10px] text-gray-400"><Mail size={9}/>{s.email}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">{s.role}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.department ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{EMP_TYPE_LABEL[s.employmentType] ?? s.employmentType}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-900">{s.basicSalary > 0 ? s.basicSalary.toLocaleString() : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[s.status] ?? 'gray'}>{s.status.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(s.hireDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-4 rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><UserCog size={16} /></div>
                <h2 className="font-semibold text-gray-900">Add Staff Member</h2>
              </div>
              <button onClick={() => { setShowForm(false); reset(); }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" required error={errors.fullName?.message} {...register('fullName')} />
                <Input label="Role / Job title" required error={errors.role?.message} {...register('role')} />
                <Input label="Department" hint="Optional" {...register('department')} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment type</label>
                  <select {...register('employmentType')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                    <option value="permanent">Permanent</option>
                    <option value="contract">Contract</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <Input label="Hire date" type="date" required error={errors.hireDate?.message} {...register('hireDate')} />
                <Input label="Basic salary (KES)" type="number" min={0} {...register('basicSalary')} />
                <Input label="Phone" type="tel" hint="Optional" {...register('phone')} />
                <Input label="Email" type="email" hint="Optional" {...register('email')} />
                <Input label="National ID" hint="Optional" {...register('nationalId')} />
                <Input label="KRA PIN" hint="Optional" {...register('kraPin')} />
                <Input label="NHIF number" hint="Optional" {...register('nhifNumber')} />
                <Input label="NSSF number" hint="Optional" {...register('nssfNumber')} />
                <Input label="Bank name" hint="Optional" {...register('bankName')} />
                <Input label="Bank account" hint="Optional" {...register('bankAccount')} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" loading={createMutation.isPending} className="flex-1">Save Staff Member</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
