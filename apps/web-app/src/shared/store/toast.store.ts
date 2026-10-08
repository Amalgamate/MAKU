import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms — default 4000
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  add(toast) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = toast.duration ?? 4000;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    if (duration > 0) {
      setTimeout(() => get().remove(id), duration);
    }
  },

  remove(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  success: (title, message) => get().add({ type: 'success', title, message }),
  error:   (title, message) => get().add({ type: 'error',   title, message, duration: 6000 }),
  warning: (title, message) => get().add({ type: 'warning', title, message }),
  info:    (title, message) => get().add({ type: 'info',    title, message }),
}));

// Convenience export — use this anywhere without hooks
export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().success(title, message),
  error:   (title: string, message?: string) => useToastStore.getState().error(title, message),
  warning: (title: string, message?: string) => useToastStore.getState().warning(title, message),
  info:    (title: string, message?: string) => useToastStore.getState().info(title, message),
};
