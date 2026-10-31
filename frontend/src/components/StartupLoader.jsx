export default function StartupLoader({ theme, leaving }) {
  const isDark = theme === 'dark';

  return (
    <div
      className={'boot-screen' + (leaving ? ' is-leaving' : '')}
      data-theme={isDark ? 'dark' : 'light'}
      role="status"
      aria-live="polite"
      aria-label="Loading NexMart"
      aria-busy={!leaving}
    >
      <div className="boot-atmosphere" aria-hidden="true">
        <span className="boot-plane" />
        <span className="boot-ring boot-ring-a" />
        <span className="boot-ring boot-ring-b" />
        <span className="boot-ring boot-ring-c" />
      </div>

      <div className="boot-lockup">
        <div className="boot-mark" aria-hidden="true">
          <span className="boot-mark-orbit" />
          <svg viewBox="0 0 100 100" role="presentation">
            <path className="boot-mark-cube" d="M50 8 86 29v42L50 92 14 71V29L50 8Z" />
            <path className="boot-mark-n" d="M34 68V32l32 36V32" />
            <circle className="boot-mark-point" cx="50" cy="8" r="3" />
          </svg>
        </div>
        <div className="boot-wordmark">NEXMART</div>
        <div className="boot-caption">A better everyday, taking shape.</div>
        <div className="boot-progress" aria-hidden="true"><span /></div>
        <div className="boot-status">{leaving ? 'Opening your store' : 'Curating your experience'}</div>
      </div>
      <span className="boot-corner boot-corner-left" aria-hidden="true">N / 01</span>
      <span className="boot-corner boot-corner-right" aria-hidden="true">NEXMART · INDIA</span>
    </div>
  );
}
