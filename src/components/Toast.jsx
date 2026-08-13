import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const icons = {
  success: { icon: '✓', color: '#9fe0bb' },
  error: { icon: '✕', color: '#f5a9a9' },
  info: { icon: 'ℹ', color: '#a8d4f0' },
  warning: { icon: '⚠', color: '#f5d76e' },
};

export default function Toast() {
  const { toasts, dismissToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const { icon, color } = icons[toast.type] || icons.info;
        return (
          <div className="toast" key={toast.id}>
            <span className="toast-icon" style={{ color }}>{icon}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" aria-label="Dismiss" onClick={() => dismissToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
