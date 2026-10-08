import { useToastStore, type ToastType } from '../store/toast.store';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const config: Record<ToastType, { icon: React.ReactNode; bar: string; bg: string; title: string; close: string }> = {
  success: {
    icon:  <CheckCircle   size={18} className="shrink-0 text-green-500" />,
    bar:   'bg-green-500',
    bg:    'bg-white border-green-200',
    title: 'text-gray-900',
    close: 'hover:bg-green-50 text-gray-400',
  },
  error: {
    icon:  <AlertCircle   size={18} className="shrink-0 text-red-500" />,
    bar:   'bg-red-500',
    bg:    'bg-white border-red-200',
    title: 'text-gray-900',
    close: 'hover:bg-red-50 text-gray-400',
  },
  warning: {
    icon:  <AlertTriangle size={18} className="shrink-0 text-amber-500" />,
    bar:   'bg-amber-500',
    bg:    'bg-white border-amber-200',
    title: 'text-gray-900',
    close: 'hover:bg-amber-50 text-gray-400',
  },
  info: {
    icon:  <Info          size={18} className="shrink-0 text-blue-500" />,
    bar:   'bg-blue-500',
    bg:    'bg-white border-blue-200',
    title: 'text-gray-900',
    close: 'hover:bg-blue-50 text-gray-400',
  },
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => {
        const c = config[toast.type];
        return (
          <div
            key={toast.id}
            role="alert"
            className={[
              'pointer-events-auto relative flex items-start gap-3 overflow-hidden',
              'rounded-xl border shadow-lg px-4 py-3',
              'animate-in slide-in-from-right-4 fade-in duration-200',
              c.bg,
            ].join(' ')}
          >
            {/* Colour bar on the left */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${c.bar}`} aria-hidden="true" />

            {/* Icon */}
            <div className="ml-1 mt-0.5">{c.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-snug ${c.title}`}>{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={() => remove(toast.id)}
              className={`shrink-0 rounded-lg p-1 transition-colors ${c.close}`}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
