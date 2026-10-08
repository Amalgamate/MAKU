import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Full-screen branded loading overlay ─────────────────────────────────────

interface PageLoaderOverlayProps {
  visible: boolean;
}

export function PageLoaderOverlay({ visible }: PageLoaderOverlayProps) {

  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#7e2710',
        opacity: visible ? 1 : 0,
        transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Spinner only — no logo */}
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg
          className="h-12 w-12 animate-spin"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <circle
            cx="20" cy="20" r="16"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="60 40"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Hook — manages overlay + page fade-in on route change ────────────────────

export function usePageTransition() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [pageKey, setPageKey] = useState(location.key);

  useEffect(() => {
    if (location.key === pageKey) return;

    // Show overlay
    setLoading(true);

    // After a short delay let the new page mount, then fade out overlay
    const id = setTimeout(() => {
      setLoading(false);
      setPageKey(location.key);
    }, 600);

    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  return { loading, pageKey };
}
