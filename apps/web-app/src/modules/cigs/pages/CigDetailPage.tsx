import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Users, MapPin, CalendarDays, Edit2, CheckCircle,
  X, UserPlus, Trash2, Plus, Leaf, GitMerge, FileText,
  Upload, Download, AlertCircle,
} from 'lucide-react';
import { Button, Badge, Input, Card, Avatar, Spinner } from '@maku/ui';
import { formatDate } from '@maku/utils';
import {
  useCig, useUpdateCig, useCigMeetings,
  useRemoveMember, useCreateMeeting, useUpdateMeeting, useDeleteMeeting,
  useCigDocuments, useUploadCigDocument, useDeleteCigDocument,
} from '../hooks/useCigs';
import { AddMemberToCig } from '../components/AddMemberToCig';
import { MeetingForm, type MeetingFormValues } from '../components/MeetingForm';
import { CigType, MemberStatus } from '@maku/shared-types';
import type { CigMeeting } from '@maku/shared-types';
import { useMemberList } from '../../members/hooks/useMembers';

type Tab = 'overview' | 'members' | 'meetings' | 'documents';

const editSchema = z.object({
  name: z.string().min(3),
  type: z.nativeEnum(CigType).optional(),
  subLocation: z.string().optional(),
  registrationDate: z.string().optional(),
  chairpersonMemberId: z.string().uuid().optional().or(z.literal('')),
  secretaryMemberId: z.string().uuid().optional().or(z.literal('')),
  treasurerMemberId: z.string().uuid().optional().or(z.literal('')),
});
type EditForm = z.infer<typeof editSchema>;

const statusVariant: Record<MemberStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  [MemberStatus.ACTIVE]:   'green',
  [MemberStatus.PENDING]:  'yellow',
  [MemberStatus.INACTIVE]: 'gray',
  [MemberStatus.DECEASED]: 'red',
};

const typeIcon: Record<CigType, React.ReactNode> = {
  [CigType.GEOGRAPHY]: <MapPin size={14} />,
  [CigType.COMMODITY]: <Leaf size={14} />,
  [CigType.MIXED]:     <GitMerge size={14} />,
};

export default function CigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<CigMeeting | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const { data: cig, isLoading } = useCig(id!);
  const { data: meetings = [], isLoading: loadingMeetings } = useCigMeetings(id!);
  const { data: documents = [], isLoading: loadingDocs } = useCigDocuments(id!);
  const updateMutation = useUpdateCig(id!);
  const removeMember = useRemoveMember(id!);
  const createMeeting = useCreateMeeting(id!);
  const updateMeeting = useUpdateMeeting(id!);
  const deleteMeeting = useDeleteMeeting(id!);
  const uploadDoc = useUploadCigDocument(id!);
  const deleteDoc = useDeleteCigDocument(id!);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const [officerSearch, setOfficerSearch] = useState('');
  const { data: officerMembersData } = useMemberList({
    search: officerSearch || undefined,
    status: MemberStatus.ACTIVE,
    page: 1,
    perPage: 50,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: cig
      ? {
          name: cig.name,
          type: cig.type,
          subLocation: cig.subLocation ?? '',
          registrationDate: cig.registrationDate ?? '',
          chairpersonMemberId: cig.chairpersonMemberId ?? '',
          secretaryMemberId: cig.secretaryMemberId ?? '',
          treasurerMemberId: cig.treasurerMemberId ?? '',
        }
      : undefined,
  });

  function onSave(values: EditForm) {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  }

  function handleMeetingSubmit(values: MeetingFormValues) {
    if (editingMeeting) {
      updateMeeting.mutate(
        { meetingId: editingMeeting.id, data: values },
        { onSuccess: () => setEditingMeeting(null) },
      );
    } else {
      createMeeting.mutate(values, { onSuccess: () => setShowMeetingForm(false) });
    }
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!cig) {
    return (
      <div className="page-container text-center py-16 text-gray-500">
        CIG not found. <Link to="/cigs" className="text-brand-700 hover:underline">Back to list</Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'members',   label: 'Members', count: cig.members?.length ?? cig.memberCount },
    { key: 'meetings',  label: 'Meetings', count: meetings.length },
    { key: 'documents', label: 'Documents', count: documents.length },
  ];

  return (
    <div className="page-container max-w-4xl space-y-4">
      {/* Back */}
      <Link to="/cigs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700 transition-colors">
        <ArrowLeft size={14} /> All CIGs
      </Link>

      {/* Header card */}
      <Card>
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Users size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{cig.name}</h1>
              <Badge variant="blue">
                <span className="flex items-center gap-1">{typeIcon[cig.type]} {cig.type}</span>
              </Badge>
              {saved && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle size={13} /> Saved
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
              {cig.subLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {cig.subLocation}
                </span>
              )}
              {cig.registrationDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={13} /> Registered {formatDate(cig.registrationDate)}
                </span>
              )}
              <span className="flex items-center gap-1.5 font-medium text-brand-700">
                <Users size={13} /> {cig.memberCount} member{cig.memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {editing ? (
              <>
                <Button size="sm" loading={updateMutation.isPending} onClick={handleSubmit(onSave)}>
                  <CheckCircle size={13} /> Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setEditing(false); reset(); }}>
                  <X size={13} /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                <Edit2 size={13} /> Edit
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.key
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={[
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                tab === t.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500',
              ].join(' ')}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ──────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">CIG Details</h2>
          {editing ? (
            <div className="space-y-4">
              <Input label="CIG name" required error={errors.name?.message} {...register('name')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select {...register('type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none">
                  <option value={CigType.GEOGRAPHY}>Geography</option>
                  <option value={CigType.COMMODITY}>Commodity</option>
                  <option value={CigType.MIXED}>Mixed</option>
                </select>
              </div>
              <Input label="Sub-location" error={errors.subLocation?.message} {...register('subLocation')} />
              <Input label="Registration date" type="date" error={errors.registrationDate?.message} {...register('registrationDate')} />

              <h3 className="text-sm font-semibold text-gray-700 pt-2 border-t border-gray-100">CIG Officers</h3>
              <p className="text-xs text-gray-500 -mt-2">Search and select a member</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search member</label>
                <input
                  type="search"
                  placeholder="Search member…"
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chairperson</label>
                <select
                  {...register('chairpersonMemberId')}
                  size={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                >
                  <option value="">— none —</option>
                  {(officerMembersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName}</option>
                  ))}
                </select>
                {errors.chairpersonMemberId && <p className="mt-1 text-xs text-red-600">{errors.chairpersonMemberId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secretary</label>
                <select
                  {...register('secretaryMemberId')}
                  size={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                >
                  <option value="">— none —</option>
                  {(officerMembersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName}</option>
                  ))}
                </select>
                {errors.secretaryMemberId && <p className="mt-1 text-xs text-red-600">{errors.secretaryMemberId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treasurer</label>
                <select
                  {...register('treasurerMemberId')}
                  size={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
                >
                  <option value="">— none —</option>
                  {(officerMembersData?.data ?? []).map((m) => (
                    <option key={m.id} value={m.id}>{m.memberNumber ?? 'PENDING'} — {m.fullName}</option>
                  ))}
                </select>
                {errors.treasurerMemberId && <p className="mt-1 text-xs text-red-600">{errors.treasurerMemberId.message}</p>}
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Name',              cig.name],
                ['Type',              cig.type],
                ['Sub-location',      cig.subLocation ?? '—'],
                ['Registered',        cig.registrationDate ? formatDate(cig.registrationDate) : '—'],
                ['Total members',     String(cig.memberCount)],
                ['Total meetings',    String(meetings.length)],
                ['Documents',         String(documents.length)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-gray-500 text-xs uppercase tracking-wide font-medium mb-0.5">{label}</dt>
                  <dd className="font-medium text-gray-900 capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      )}

      {/* ── Members Tab ───────────────────────────────────────────────────── */}
      {tab === 'members' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{cig.members?.length ?? 0} members in this CIG</p>
            <Button size="sm" onClick={() => setShowAddMember(true)}>
              <UserPlus size={14} /> Add Member
            </Button>
          </div>

          {!cig.members?.length ? (
            <Card>
              <div className="py-10 text-center">
                <Users size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No members in this CIG yet.</p>
                <Button size="sm" className="mt-3" onClick={() => setShowAddMember(true)}>
                  <UserPlus size={14} /> Add first member
                </Button>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-gray-50">
                {cig.members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <Avatar name={m.fullName} src={m.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/members/${m.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-brand-700 transition-colors"
                      >
                        {m.fullName}
                      </Link>
                      <p className="text-xs text-gray-400 truncate">
                        {m.memberNumber ?? 'Pending'} · {m.phonePrimary}
                        {m.subLocation ? ` · ${m.subLocation}` : ''}
                      </p>
                    </div>
                    <Badge variant={statusVariant[m.status]}>{m.status}</Badge>
                    <button
                      onClick={() => {
                        if (deletingMemberId === m.id) {
                          removeMember.mutate(m.id);
                          setDeletingMemberId(null);
                        } else {
                          setDeletingMemberId(m.id);
                          setTimeout(() => setDeletingMemberId(null), 3000);
                        }
                      }}
                      title={deletingMemberId === m.id ? 'Click again to confirm remove' : 'Remove from CIG'}
                      className={[
                        'rounded-lg p-1.5 transition-colors',
                        deletingMemberId === m.id
                          ? 'bg-red-100 text-red-600'
                          : 'text-gray-300 hover:bg-red-50 hover:text-red-500',
                      ].join(' ')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* ── Meetings Tab ──────────────────────────────────────────────────── */}
      {tab === 'meetings' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''} recorded</p>
            <Button size="sm" onClick={() => setShowMeetingForm(true)}>
              <Plus size={14} /> Record Meeting
            </Button>
          </div>

          {loadingMeetings ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : meetings.length === 0 ? (
            <Card>
              <div className="py-10 text-center">
                <CalendarDays size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No meetings recorded yet.</p>
                <Button size="sm" className="mt-3" onClick={() => setShowMeetingForm(true)}>
                  <Plus size={14} /> Record first meeting
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.map((m) => (
                <Card key={m.id} padding="sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <CalendarDays size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">{formatDate(m.date)}</span>
                          {m.venue && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={11} /> {m.venue}
                            </span>
                          )}
                          <Badge variant="gray">
                            <Users size={11} className="inline mr-1" />
                            {m.attendanceCount} attended
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{m.agenda}</p>
                        {m.minutes && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{m.minutes}</p>
                        )}
                        {m.actionItems && (
                          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5">
                            <p className="text-xs text-amber-800 font-medium">Action items:</p>
                            <p className="text-xs text-amber-700 mt-0.5">{m.actionItems}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setEditingMeeting(m)}
                        className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteMeeting.mutate(m.id)}
                        className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Documents Tab ─────────────────────────────────────────────── */}
      {tab === 'documents' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-800 transition-colors">
              <Upload size={13} />
              {uploadDoc.isPending ? 'Uploading…' : 'Upload Document'}
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadDoc.mutate({
                    file,
                    meta: {
                      name: file.name.replace(/\.[^.]+$/, ''),
                      year: new Date().getFullYear(),
                    },
                  });
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {loadingDocs ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : documents.length === 0 ? (
            <Card>
              <div className="py-10 text-center">
                <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500 mb-1">No documents uploaded yet.</p>
                <p className="text-xs text-gray-400">Upload minutes, registration certificates, financials, and other CIG documents.</p>
              </div>
            </Card>
          ) : (
            <Card padding="none">
              <ul className="divide-y divide-gray-50">
                {documents.map((doc) => {
                  const isImage = doc.mimeType?.startsWith('image/');
                  const isPdf = doc.mimeType === 'application/pdf';
                  return (
                    <li key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <div className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                        isPdf ? 'bg-red-50 text-red-600' : isImage ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500',
                      ].join(' ')}>
                        {isPdf ? 'PDF' : isImage ? 'IMG' : 'DOC'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">
                          {doc.category} {doc.year ? `· ${doc.year}` : ''}
                          {doc.fileSize ? ` · ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-700 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                        <button
                          onClick={() => {
                            if (deletingDocId === doc.id) {
                              deleteDoc.mutate(doc.id);
                              setDeletingDocId(null);
                            } else {
                              setDeletingDocId(doc.id);
                              setTimeout(() => setDeletingDocId(null), 3000);
                            }
                          }}
                          className={[
                            'rounded-lg p-1.5 transition-colors text-xs',
                            deletingDocId === doc.id
                              ? 'bg-red-100 text-red-600 px-2 font-medium'
                              : 'text-gray-300 hover:bg-red-50 hover:text-red-500',
                          ].join(' ')}
                          title={deletingDocId === doc.id ? 'Click again to confirm' : 'Delete'}
                        >
                          {deletingDocId === doc.id ? 'Confirm?' : <Trash2 size={13} />}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddMember && (
        <AddMemberToCig
          cigId={id!}
          existingMemberIds={cig.members?.map((m) => m.id) ?? []}
          onClose={() => setShowAddMember(false)}
        />
      )}
      {(showMeetingForm || editingMeeting) && (
        <MeetingForm
          onSubmit={handleMeetingSubmit}
          onClose={() => { setShowMeetingForm(false); setEditingMeeting(null); }}
          isPending={createMeeting.isPending || updateMeeting.isPending}
          defaultValues={editingMeeting ?? undefined}
        />
      )}
    </div>
  );
}
