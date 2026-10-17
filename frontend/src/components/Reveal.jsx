import { useEffect, useRef, useState } from 'react';

// fades + slides an element up the first time it scrolls into view
export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={'rvl' + (on ? ' rv-on' : '') + (className ? ' ' + className : '')} style={{ transitionDelay: delay + 'ms' }} {...rest}>{children}</Tag>;
}
