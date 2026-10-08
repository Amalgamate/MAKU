import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/Sidebar';
import { TopBar } from '../shared/components/TopBar';
import { OfflineBanner } from '../shared/components/OfflineBanner';
import { ToastContainer } from '../shared/components/ToastContainer';

export function AppLayout() {
  // Mobile: drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop: collapsed (icon-only) vs expanded
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <OfflineBanner />
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
