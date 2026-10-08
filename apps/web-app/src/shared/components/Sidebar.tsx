import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Network,
  Beef,
  Tractor,
  Droplets,
  Sprout,
  ShoppingCart,
  Landmark,
  Wallet,
  ClipboardList,
  UserCog,
  Building2,
  Globe,
  TrendingUp,
  FolderOpen,
  FileText,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  X,
  ChevronDown,
  BarChart3,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useOrgStore } from '../../modules/settings/store/org.store';
import { Avatar } from '@maku/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;   // group icon shown in collapsed mode
  items: NavItem[];
}

// ─── Nav definition — every icon is unique ───────────────────────────────────

const navGroups: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    icon: <LayoutDashboard size={20} />,
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={16} /> },
      { label: 'Reports',   to: '/reports',   icon: <BarChart3 size={16} /> },
    ],
  },
  {
    id: 'members',
    label: 'Members & Groups',
    icon: <Users size={20} />,
    items: [
      { label: 'Member Register', to: '/members', icon: <Users size={16} /> },
      { label: 'CIGs',            to: '/cigs',    icon: <Network size={16} /> },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: <Beef size={20} />,
    items: [
      { label: 'Livestock Marketing', to: '/livestock',      icon: <Beef size={16} /> },
      { label: 'Feedlot',             to: '/feedlot',        icon: <Tractor size={16} /> },
      { label: 'Water Vouchers',      to: '/water-vouchers', icon: <Droplets size={16} /> },
      { label: 'Commodities',         to: '/commodities',    icon: <Sprout size={16} /> },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: <Landmark size={20} />,
    items: [
      { label: 'Purchases & Sales', to: '/finance/purchases', icon: <ShoppingCart size={16} /> },
      { label: 'Finance Ledger',    to: '/finance',           icon: <Landmark size={16} /> },
      { label: 'Petty Cash',        to: '/finance/petty-cash',icon: <Wallet size={16} /> },
      { label: 'Procurement',       to: '/procurement',       icon: <ClipboardList size={16} /> },
    ],
  },
  {
    id: 'people',
    label: 'People',
    icon: <UserCog size={20} />,
    items: [
      { label: 'Staff',     to: '/staff',     icon: <UserCog size={16} /> },
      { label: 'Suppliers', to: '/suppliers', icon: <Building2 size={16} /> },
    ],
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    icon: <Globe size={20} />,
    items: [
      { label: 'NGO & Partners',  to: '/ngos',     icon: <Globe size={16} /> },
      { label: 'Grants Pipeline', to: '/grants',   icon: <TrendingUp size={16} /> },
      { label: 'Projects',        to: '/projects', icon: <FolderOpen size={16} /> },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: <Settings size={20} />,
    items: [
      { label: 'Documents',      to: '/documents',      icon: <FileText size={16} /> },
      { label: 'Communications', to: '/communications', icon: <MessageSquare size={16} /> },
      { label: 'Audit Trail',    to: '/audit',          icon: <Shield size={16} /> },
      { label: 'Settings',       to: '/settings',       icon: <Settings size={16} /> },
    ],
  },
];

// ─── Animated collapsible panel ──────────────────────────────────────────────

function AnimatedPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    // Measure actual content height
    if (open) {
      setHeight(ref.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      style={{
        height,
        overflow: 'hidden',
        transition: 'height 260ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div ref={ref} className="pt-0.5 pb-1 space-y-0.5">
        {children}
      </div>
    </div>
  );
}

// ─── Expanded nav group — accordion behaviour ─────────────────────────────────

const linkBase     = 'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-150';
const linkInactive = 'text-white/70 hover:bg-white/10 hover:text-white';
const linkActive   = 'bg-white/15 text-white';

function NavGroupExpanded({
  group,
  isOpen,
  onToggle,
  onClose,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const location = useLocation();
  const hasActive = group.items.some((i) =>
    i.to === '/dashboard' ? location.pathname === i.to : location.pathname.startsWith(i.to),
  );

  return (
    <div>
      {/* Group header button */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={[
          'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors duration-150',
          hasActive && !isOpen
            ? 'text-white/90 bg-white/10'
            : 'text-white/50 hover:text-white/80 hover:bg-white/5',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <span className={hasActive ? 'text-white/80' : ''}>{group.icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            {group.label}
          </span>
        </div>
        <ChevronDown
          size={13}
          className={[
            'shrink-0 transition-transform duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
            isOpen ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
        />
      </button>

      {/* Animated items */}
      <AnimatedPanel open={isOpen}>
        {group.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              ['ml-2', linkBase, isActive ? linkActive : linkInactive].join(' ')
            }
          >
            <span className="shrink-0 opacity-80">{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
          </NavLink>
        ))}
      </AnimatedPanel>
    </div>
  );
}

// ─── Collapsed icon-only nav — shows one icon per group ──────────────────────

function NavIconOnly({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1 px-1.5 py-1">
      {navGroups.map((group) => {
        // Show first item's route as the link target
        const firstItem = group.items[0];
        if (!firstItem) return null;
        return (
          <NavLink
            key={group.id}
            to={firstItem.to}
            onClick={onClose}
            title={group.label}
            className={({ isActive }) =>
              [
                'flex items-center justify-center rounded-xl w-10 h-10 transition-colors duration-150',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            {group.icon}
          </NavLink>
        );
      })}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  const user        = useAuthStore((s) => s.user);
  const logout      = useAuthStore((s) => s.logout);
  const navigate    = useNavigate();
  const location    = useLocation();
  const org         = useOrgStore();

  // Accordion state — only one group open at a time.
  // On collapse → expand, all groups start closed.
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  // When sidebar expands, open the group that contains the active route
  useEffect(() => {
    if (!collapsed) {
      const active = navGroups.find((g) =>
        g.items.some((i) =>
          i.to === '/dashboard'
            ? location.pathname === i.to
            : location.pathname.startsWith(i.to),
        ),
      );
      setOpenGroupId(active?.id ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  function toggleGroup(id: string) {
    setOpenGroupId((cur) => (cur === id ? null : id));
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // ── Sidebar content (shared between mobile drawer and desktop) ─────────────
  function SidebarContent({ mobile = false }: { mobile?: boolean }) {
    const isCollapsed = collapsed && !mobile;

    return (
      <div className="flex h-full flex-col bg-brand-700">

        {/* Logo + collapse toggle */}
        <div
          className={[
            'flex items-center gap-2 border-b border-white/10 px-3 py-3',
            isCollapsed ? 'justify-center' : 'justify-between',
          ].join(' ')}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              {org.logoUrl ? (
                <img
                  src={org.logoUrl}
                  alt={org.name}
                  className="h-8 w-auto max-w-[120px] object-contain shrink-0"
                />
              ) : (
                <>
                  <Sprout size={22} className="text-brand-200 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white tracking-tight block leading-tight">{org.name}</span>
                    <span className="text-[10px] text-brand-300 leading-tight block">Cooperative Platform</span>
                  </div>
                </>
              )}
            </div>
          )}
          {isCollapsed && (
            org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="h-7 w-7 object-contain rounded" />
            ) : (
              <Sprout size={24} className="text-brand-200" />
            )
          )}

          <div className="flex shrink-0 items-center">
            {!mobile && (
              <button
                onClick={onToggleCollapse}
                className="rounded-md p-1 text-brand-300 hover:bg-white/10 hover:text-white transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
              </button>
            )}
            {mobile && (
              <button onClick={onMobileClose} className="rounded-md p-1 text-brand-200 hover:text-white" aria-label="Close sidebar">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Main navigation"
        >
          {isCollapsed ? (
            <NavIconOnly onClose={onMobileClose} />
          ) : (
            <div className="px-2 space-y-0.5">
              {navGroups.map((group) => (
                <NavGroupExpanded
                  key={group.id}
                  group={group}
                  isOpen={openGroupId === group.id}
                  onToggle={() => toggleGroup(group.id)}
                  onClose={onMobileClose}
                />
              ))}
            </div>
          )}
        </nav>

        {/* User footer */}
        {user && (
          <div className="border-t border-white/10 px-2 py-2">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-1">
                <NavLink
                  to="/profile"
                  onClick={onMobileClose}
                  title={user.fullName}
                  className="rounded-full p-0.5 hover:ring-2 hover:ring-white/30 transition-all"
                >
                  <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                </NavLink>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center justify-center rounded-xl w-10 h-10 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  onClick={onMobileClose}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/10 transition-colors mb-0.5"
                >
                  <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white leading-tight">{user.fullName}</p>
                    <p className="truncate text-[10px] text-brand-300 capitalize leading-tight">
                      {user.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-60 lg:hidden',
          'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent mobile />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={[
          'hidden lg:flex lg:flex-col lg:flex-shrink-0',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'lg:w-16' : 'lg:w-60',
        ].join(' ')}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
