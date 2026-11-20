import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { CATS } from '../utils/format';

// Top sheet menu: categories as a grid, sub-categories open as chips
export default function CategoryDrawer({ open, onClose }) {
  const { user, setAuthOpen, logout } = useAuth();
  const { products, toast } = useShop();
  const [openCat, setOpenCat] = useState('');
  const greetingRef = useRef(null);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const greeting = user ? `Hi, ${firstName}` : 'Welcome, sign in';

  const tree = useMemo(() => Object.keys(CATS).map((c) => {
    const subs = {};
    products.filter((p) => p.category === c).forEach((p) => { subs[p.subcategory || c] = (subs[p.subcategory || c] || 0) + 1; });
    return { key: c, subs: Object.entries(subs).sort((a, b) => a[0].localeCompare(b[0])) };
  }), [products]);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  useEffect(() => {
    if (!open) setOpenCat('');
  }, [open]);

  useEffect(() => {
    const el = greetingRef.current;
    const header = el?.parentElement;
    const close = header?.querySelector('.dw-x');
    if (!el || !header) return undefined;
    const fit = () => {
      const available = Math.max(90, header.clientWidth - (close?.getBoundingClientRect().width || 74) - 14);
      const style = window.getComputedStyle(el);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = `${style.fontWeight} 100px ${style.fontFamily}`;
      const textWidthAt100 = ctx.measureText(greeting).width;
      const fitted = Math.min(34, available * 94 / Math.max(textWidthAt100, 1));
      el.style.fontSize = `${Math.max(10, fitted)}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(header);
    window.addEventListener('resize', fit);
    return () => { observer.disconnect(); window.removeEventListener('resize', fit); };
  }, [greeting, open]);

  return (
    <>
      <div className={'dw-ov' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'dw' + (open ? ' on' : '')} aria-hidden={!open}>
        <div className="w">
          <div className="dw-top">
            <span ref={greetingRef} className="dw-hi" onClick={() => { if (!user) { onClose(); setAuthOpen(true); } }} style={{ cursor: user ? 'default' : 'pointer' }}>{greeting}</span>
            <button className="dw-x" onClick={onClose} aria-label="Close menu">Close</button>
          </div>
          <div className="dw-grid">
            <section>
              <h4>Browse</h4>
              <div className="dw-catlist">
                {tree.map((c) => (
                  <div className="dw-catitem" key={c.key}>
                    <button
                      className={'dw-cat' + (openCat === c.key ? ' on' : '')}
                      aria-expanded={openCat === c.key}
                      onClick={() => setOpenCat(openCat === c.key ? '' : c.key)}
                    >{CATS[c.key]}<span aria-hidden="true">{openCat === c.key ? '−' : '+'}</span></button>
                    {openCat === c.key && (
                      <div className="dw-subs">
                        <Link onClick={onClose} to={'/c/' + c.key}>All in {CATS[c.key]}</Link>
                        {c.subs.map(([s, n]) => <Link onClick={onClose} key={s} to={'/c/' + c.key + '?sub=' + encodeURIComponent(s)}>{s}<span>{n}</span></Link>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h4>Popular</h4>
              <Link className="dw-lnk" onClick={onClose} to="/">Home</Link>
              <Link className="dw-lnk" onClick={onClose} to="/shop">All products</Link>
              <Link className="dw-lnk" onClick={onClose} to="/deals">Hot deals</Link>
              <h4>My NexMart</h4>
              <Link className="dw-lnk" onClick={onClose} to="/account">My account</Link>
              <Link className="dw-lnk" onClick={onClose} to="/orders">My orders</Link>
              <Link className="dw-lnk" onClick={onClose} to="/wishlist">My wishlist</Link>
              {user ? <button className="dw-lnk" onClick={() => { logout(); toast('You have signed out safely', 'info'); onClose(); }}>Sign out</button>
                : <button className="dw-lnk" onClick={() => { onClose(); setAuthOpen(true); }}>Sign in</button>}
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
