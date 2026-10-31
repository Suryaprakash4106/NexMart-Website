import { useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import ConfirmDialog from './ConfirmDialog';

const MARKS = {
  success: <path d="m6 12 4 4 8-9" />,
  error: <><path d="M12 8v5" /><path d="M12 17h.01" /><path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.8 3h14.8a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
  warning: <><path d="M12 8v5" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></>,
  info: <><path d="M12 11v5" /><path d="M12 8h.01" /><circle cx="12" cy="12" r="9" /></>,
};

export default function Toast() {
  const { notification, dismissNotification, confirmation, resolveConfirm } = useShop();
  const type = notification?.type || 'info';

  useEffect(() => {
    if (!notification) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') dismissNotification(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notification, dismissNotification]);

  return (
    <>
      <div key={notification?.id || 'empty'} className={'nm-notice nm-notice-' + type + (notification ? ' is-visible' : '')} role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
        <span className="nm-notice-icon" aria-hidden="true"><svg viewBox="0 0 24 24">{MARKS[type] || MARKS.info}</svg></span>
        <span className="nm-notice-copy">
          <b>NEXMART <i>·</i> {type === 'success' ? 'COMPLETE' : type === 'error' ? 'NEEDS ATTENTION' : type === 'warning' ? 'NOTICE' : 'UPDATE'}</b>
          <span>{notification?.message || ''}</span>
        </span>
        <button type="button" className="nm-notice-close" onClick={dismissNotification} aria-label="Dismiss notification">×</button>
        {notification && <span className="nm-notice-timer" key={notification.id} />}
      </div>
      <ConfirmDialog confirmation={confirmation} onResolve={resolveConfirm} />
    </>
  );
}
