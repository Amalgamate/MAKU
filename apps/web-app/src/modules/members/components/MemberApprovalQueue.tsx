import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Badge, Card, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import { usePendingMembers, useApproveMember, useRejectMember } from '../hooks/useMembers';

interface RejectState {
  memberId: string;
  reason: string;
}

export function MemberApprovalQueue() {
  const { data: pending = [], isLoading } = usePendingMembers();
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();
  const [collapsed, setCollapsed] = useState(false);
  const [rejecting, setRejecting] = useState<RejectState | null>(null);

  if (isLoading) return <Spinner className="my-4" />;
  if (pending.length === 0) return null;

  function handleApprove(id: string) {
    approveMutation.mutate(id);
  }

  function handleRejectSubmit() {
    if (!rejecting || !rejecting.reason.trim()) return;
    rejectMutation.mutate(
      { id: rejecting.memberId, reason: rejecting.reason },
      { onSuccess: () => setRejecting(null) },
    );
  }

  return (
    <Card padding="none" className="border-amber-200 bg-amber-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
            {pending.length}
          </span>
          <h2 className="text-sm font-semibold text-amber-900">
            Pending Approval{pending.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-amber-700 hover:text-amber-900"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Rejection modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Reject Registration</h3>
            <textarea
              value={rejecting.reason}
              onChange={(e) => setRejecting({ ...rejecting, reason: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-brand-600 focus:outline-none"
              placeholder="Enter rejection reason (required)…"
              aria-label="Rejection reason"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setRejecting(null)}>Cancel</Button>
              <Button
                variant="danger"
                size="sm"
                loading={rejectMutation.isPending}
                disabled={!rejecting.reason.trim()}
                onClick={handleRejectSubmit}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Queue list */}
      {!collapsed && (
        <ul className="divide-y divide-amber-100 px-4 pb-4">
          {pending.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{m.fullName}</p>
                <p className="text-xs text-gray-500">
                  {m.nationalId} · {m.phonePrimary} · {formatDate(m.registrationDate)}
                </p>
                {m.subLocation && (
                  <p className="text-xs text-gray-400">{m.subLocation}{m.village ? `, ${m.village}` : ''}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/members/${m.id}`} className="text-xs text-brand-700 hover:underline">
                  View
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={approveMutation.isPending && approveMutation.variables === m.id}
                  onClick={() => handleApprove(m.id)}
                  className="!text-green-700 !border-green-300 hover:!bg-green-50"
                >
                  <CheckCircle size={13} /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setRejecting({ memberId: m.id, reason: '' })}
                  className="!text-red-700 !border-red-300 hover:!bg-red-50"
                >
                  <XCircle size={13} /> Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
