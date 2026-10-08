import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, X, Search } from 'lucide-react';
import { Button, Spinner } from '@maku/ui';
import { useAddMember } from '../hooks/useCigs';
import { useMemberList } from '../../members/hooks/useMembers';
import { MemberStatus } from '@maku/shared-types';

interface Props {
  cigId: string;
  existingMemberIds: string[];
  onClose: () => void;
}

const schema = z.object({ search: z.string().optional() });

export function AddMemberToCig({ cigId, existingMemberIds, onClose }: Props) {
  const [search, setSearch] = useState('');
  const addMutation = useAddMember(cigId);

  const { data, isLoading } = useMemberList({
    search: search || undefined,
    status: MemberStatus.ACTIVE,
    page: 1,
    perPage: 20,
  });

  const available = (data?.data ?? []).filter(
    (m) => !existingMemberIds.includes(m.id),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <UserPlus size={16} />
            </div>
            <h2 className="font-semibold text-gray-900">Add Member to CIG</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search active members…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-100">
            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : available.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                {search ? 'No matching active members' : 'All active members are already in this CIG'}
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {available.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.fullName}</p>
                      <p className="text-xs text-gray-400">
                        {m.memberNumber ?? 'Pending'} · {m.phonePrimary}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={addMutation.isPending && addMutation.variables === m.id}
                      onClick={() => addMutation.mutate(m.id, { onSuccess: onClose })}
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
