import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CalendarDays } from 'lucide-react';
import { Button, Input } from '@maku/ui';
import type { CigMeeting } from '@maku/shared-types';

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  agenda: z.string().min(5, 'Agenda is required'),
  venue: z.string().optional(),
  attendanceCount: z.coerce.number().min(0).optional(),
  minutes: z.string().optional(),
  actionItems: z.string().optional(),
});
export type MeetingFormValues = z.infer<typeof schema>;

interface Props {
  onSubmit: (values: MeetingFormValues) => void;
  onClose: () => void;
  isPending: boolean;
  defaultValues?: Partial<CigMeeting>;
}

export function MeetingForm({ onSubmit, onClose, isPending, defaultValues }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<MeetingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          date: defaultValues.date ?? '',
          agenda: defaultValues.agenda ?? '',
          venue: defaultValues.venue ?? '',
          attendanceCount: defaultValues.attendanceCount ?? 0,
          minutes: defaultValues.minutes ?? '',
          actionItems: defaultValues.actionItems ?? '',
        }
      : { date: new Date().toISOString().slice(0, 10), attendanceCount: 0 },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <CalendarDays size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">
              {defaultValues ? 'Edit Meeting' : 'Record Meeting'}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Meeting date" type="date" required error={errors.date?.message} {...register('date')} />
            <Input label="Attendance count" type="number" min={0} error={errors.attendanceCount?.message} {...register('attendanceCount')} />
          </div>

          <Input
            label="Venue"
            placeholder="e.g. Merti Community Hall"
            hint="Optional"
            error={errors.venue?.message}
            {...register('venue')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agenda <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('agenda')}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 resize-none"
              placeholder="What was discussed?"
            />
            {errors.agenda && <p className="mt-1 text-xs text-red-600">{errors.agenda.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
            <textarea
              {...register('minutes')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 resize-none"
              placeholder="Meeting minutes and decisions made…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action items</label>
            <textarea
              {...register('actionItems')}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 resize-none"
              placeholder="Follow-up actions and responsibilities…"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={isPending} className="flex-1">
              {defaultValues ? 'Save changes' : 'Record meeting'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
