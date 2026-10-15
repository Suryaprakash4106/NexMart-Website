import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { CATS } from '../utils/format';

// Top sheet menu: categories as a grid, sub-categories open as chips
export default function CategoryDrawer({ open, onClose }) {
  const { user, setAuthOpen, logout } = useAuth();
  const { products } = useShop();
  const [openCat, setOpenCat] = useState('');

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

  const cur = tree.find((c) => c.key === openCat);

  return (
    <>
      <div className={'dw-ov' + (open ? ' on' : '')} onClick={onClose} />
      <aside className={'dw' + (open ? ' on' : '')} aria-hidden={!open}>
        <div className="w">
          <div className="dw-top">
            <span className="dw-hi" onClick={() => { if (!user) { onClose(); setAuthOpen(true); } }} style={{ cursor: user ? 'default' : 'pointer' }}>{user ? 'Hi, ' + user.name.split(' ')[0] : 'Welcome, sign in'}</span>
            <button className="dw-x" onClick={onClose} aria-label="Close menu">Close</button>
          </div>
          <div className="dw-grid">
            <section>
              <h4>Browse</h4>
              <div className="dw-catlist">
                {tree.map((c) => (
                  <button key={c.key} className={'dw-cat' + (openCat === c.key ? ' on' : '')} onClick={() => setOpenCat(openCat === c.key ? '' : c.key)}>{CATS[c.key]}</button>
                ))}
              </div>
              {cur && (
                <div className="dw-subs">
                  <Link to={'/c/' + cur.key}>All in {CATS[cur.key]}</Link>
                  {cur.subs.map(([s, n]) => <Link key={s} to={'/c/' + cur.key + '?sub=' + encodeURIComponent(s)}>{s}<span>{n}</span></Link>)}
                </div>
              )}
            </section>
            <section>
              <h4>Popular</h4>
              <Link className="dw-lnk" to="/deals">Hot deals</Link>
              <h4>My NexMart</h4>
              <Link className="dw-lnk" to="/account">My account</Link>
              <Link className="dw-lnk" to="/orders">My orders</Link>
              <Link className="dw-lnk" to="/wishlist">My wishlist</Link>
              {user ? <button className="dw-lnk" onClick={() => { logout(); onClose(); }}>Sign out</button>
                : <button className="dw-lnk" onClick={() => { onClose(); setAuthOpen(true); }}>Sign in</button>}
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}
