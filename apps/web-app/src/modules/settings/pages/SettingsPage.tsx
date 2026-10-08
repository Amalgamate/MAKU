import { Settings, Users, Shield, Bell, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@maku/ui';

const settingsSections = [
  { title: 'User Management', description: 'Create and manage staff accounts, assign roles.', to: '/settings/users', icon: <Users size={20} />, available: true },
  { title: 'System Configuration', description: 'Organisation name, logo, and platform settings.', to: '/settings/system', icon: <Settings size={20} />, available: true },
  { title: 'Roles & Permissions', description: 'Define custom roles with granular permissions.', to: '/settings/roles', icon: <Shield size={20} />, available: false },
  { title: 'Notifications', description: 'Configure SMS and email notification triggers.', to: '/settings/notifications', icon: <Bell size={20} />, available: false },
  { title: 'Integrations', description: 'M-Pesa, SMS gateway, and email configuration.', to: '/settings/integrations', icon: <Globe size={20} />, available: false },
];

export default function SettingsPage() {
  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Settings size={22} />
        </div>
        <div>
          <h1 className="section-heading">Settings</h1>
          <p className="text-sm text-gray-500">Manage system configuration and access control.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {settingsSections.map((s) => (
          s.available ? (
            <Link key={s.to} to={s.to}>
              <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">{s.icon}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ) : (
            <Card key={s.to} className="opacity-60 h-full">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">{s.icon}</div>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{s.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
}
