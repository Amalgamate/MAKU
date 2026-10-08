import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/Sidebar';
import { TopBar } from '../shared/components/TopBar';
import { OfflineBanner } from '../shared/components/OfflineBanner';
import { ToastContainer } from '../shared/components/ToastContainer';
import { PageLoaderOverlay, usePageTransition } from '../shared/components/PageLoader';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { loading, pageKey } = usePageTransition();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Loading overlay — floats above everything */}
      <PageLoaderOverlay visible={loading} />

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
          {/* key forces remount + re-triggers page-enter animation on route change */}
          <div key={pageKey} className="page-enter h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
