import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ confirmation, onResolve }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!confirmation) return undefined;
    cancelRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape') onResolve(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmation, onResolve]);

  if (!confirmation) return null;

  return (
    <div className="nm-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onResolve(false); }}>
      <section className="nm-confirm" role="alertdialog" aria-modal="true" aria-labelledby="nm-confirm-title" aria-describedby="nm-confirm-message">
        <div className="nm-confirm-mark" aria-hidden="true">{confirmation.danger ? '!' : '?'}</div>
        <span className="nm-confirm-kicker">NEXMART CONFIRMATION</span>
        <h2 id="nm-confirm-title">{confirmation.title}</h2>
        <p id="nm-confirm-message">{confirmation.message}</p>
        <div className="nm-confirm-actions">
          <button ref={cancelRef} type="button" className="nm-confirm-cancel" onClick={() => onResolve(false)}>{confirmation.cancelLabel}</button>
          <button type="button" className={'nm-confirm-accept' + (confirmation.danger ? ' is-danger' : '')} onClick={() => onResolve(true)}>{confirmation.confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
