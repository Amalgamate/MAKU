import { useState } from 'react';
import { MessageSquare, Send, Users, User, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Badge, Spinner } from '@maku/ui';
import { formatDateTime } from '@maku/utils';
import { useMemberList } from '../../members/hooks/useMembers';
import { useCigList } from '../../cigs/hooks/useCigs';
import { MemberStatus } from '@maku/shared-types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api.client';
import { toast } from '../../../shared/store/toast.store';

// ─── Recipient types ──────────────────────────────────────────────────────────
type RecipientType = 'all_active' | 'cig' | 'individual';

interface SmsLog {
  id: string;
  message: string;
  recipientType: string;
  recipientLabel: string;
  sentCount: number;
  status: 'sent' | 'failed' | 'pending';
  createdAt: string;
}

// Fetch from API — endpoint will be wired when SMS gateway is connected
function useSmsLogs() {
  return useQuery({
    queryKey: ['sms-logs'],
    queryFn: async (): Promise<SmsLog[]> => {
      try {
        const res = await apiClient.get<{ data: SmsLog[] }>('/communications/sms');
        return res.data.data;
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 30,
  });
}

const STATUS_VARIANT = { sent: 'green', failed: 'red', pending: 'yellow' } as const;

export default function CommunicationsPage() {
  const [recipientType, setRecipientType] = useState<RecipientType>('all_active');
  const [selectedCigId, setSelectedCigId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [message, setMessage] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const maxChars = 160;

  const { data: cigs = [] } = useCigList();
  const { data: activeData } = useMemberList({ status: MemberStatus.ACTIVE, page: 1, perPage: 500 });
  const { data: memberSearchData } = useMemberList({ search: memberSearch || undefined, status: MemberStatus.ACTIVE, page: 1, perPage: 20 });
  const { data: logs = [], isLoading: logsLoading } = useSmsLogs();

  const totalActive = activeData?.meta?.total ?? 0;
  const selectedCig = cigs.find((c) => c.id === selectedCigId);

  // Compute recipient summary
  const recipientSummary = () => {
    if (recipientType === 'all_active') return `All active members (${totalActive})`;
    if (recipientType === 'cig') return selectedCig ? `${selectedCig.name} (${selectedCig.memberCount} members)` : 'Select a CIG';
    const m = memberSearchData?.data.find((m) => m.id === selectedMemberId);
    return m ? `${m.fullName} · ${m.phonePrimary}` : 'Select a member';
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      // This will call the SMS endpoint when wired — for now logs to console in dev
      return apiClient.post('/communications/sms', {
        message,
        recipientType,
        cigId: recipientType === 'cig' ? selectedCigId : undefined,
        memberId: recipientType === 'individual' ? selectedMemberId : undefined,
      });
    },
    onSuccess: () => {
      toast.success('SMS queued', `Message will be sent to ${recipientSummary()}`);
      setMessage('');
    },
    onError: () => {
      // Show as info — SMS gateway not yet configured
      toast.info('SMS gateway not configured', 'Connect Africa\'s Talking API key in Settings → Integrations to enable SMS sending.');
    },
  });

  const canSend = message.trim().length > 0 && message.length <= maxChars &&
    (recipientType === 'all_active' ||
     (recipientType === 'cig' && !!selectedCigId) ||
     (recipientType === 'individual' && !!selectedMemberId));

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="section-heading">Communications</h1>
          <p className="text-sm text-gray-500">Send SMS to members, CIGs, or individuals</p>
        </div>
      </div>

      {/* SMS gateway notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">SMS gateway not yet connected</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Add your Africa's Talking API key in <strong>Settings → System → Integrations</strong> to enable live SMS sending.
            You can still compose and preview messages below.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compose */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Compose SMS</h2>

          {/* Recipients */}
          <div className="space-y-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Send to</p>
            {([
              { value: 'all_active', label: `All active members`, icon: <Users size={14} />, sub: `${totalActive} recipients` },
              { value: 'cig',        label: 'A specific CIG',     icon: <Users size={14} />, sub: 'Select below' },
              { value: 'individual', label: 'One member',         icon: <User size={14} />,  sub: 'Search below' },
            ] as const).map((opt) => (
              <label key={opt.value} className={[
                'flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all',
                recipientType === opt.value ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-brand-300',
              ].join(' ')}>
                <input
                  type="radio"
                  name="recipient"
                  value={opt.value}
                  checked={recipientType === opt.value}
                  onChange={() => setRecipientType(opt.value)}
                  className="accent-brand-600"
                />
                <div className="text-brand-700">{opt.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.sub}</p>
                </div>
              </label>
            ))}

            {recipientType === 'cig' && (
              <select value={selectedCigId} onChange={(e) => setSelectedCigId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                <option value="">Select a CIG</option>
                {cigs.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.memberCount} members)</option>)}
              </select>
            )}

            {recipientType === 'individual' && (
              <div className="space-y-2">
                <input
                  type="search"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search member name or number…"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                />
                <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}
                  size={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                  <option value="">Select a member</option>
                  {(memberSearchData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName} · {m.phonePrimary}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <span className={`text-xs ${message.length > maxChars ? 'text-red-500' : 'text-gray-400'}`}>
                {message.length}/{maxChars}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your message here…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none resize-none"
            />
          </div>

          {/* Preview */}
          {message.trim() && (
            <div className="mt-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1 font-medium">Preview</p>
              <p className="text-xs text-gray-700 font-medium">To: {recipientSummary()}</p>
              <p className="text-xs text-gray-600 mt-1">{message}</p>
            </div>
          )}

          <Button
            className="w-full mt-4"
            disabled={!canSend}
            loading={sendMutation.isPending}
            onClick={() => sendMutation.mutate()}
          >
            <Send size={14} /> Send SMS
          </Button>
        </Card>

        {/* Message history */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">Message History</h2>
          </div>
          {logsLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No messages sent yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {logs.map((log) => (
                <li key={log.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs text-gray-500">{log.recipientLabel}</p>
                    <Badge variant={STATUS_VARIANT[log.status] ?? 'gray'}>{log.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2">{log.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                    <span>{formatDateTime(log.createdAt)}</span>
                    <span>{log.sentCount} sent</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
