import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { CATS } from '../utils/format';
import CategoryDrawer from './CategoryDrawer';
import { Sun, Moon, Heart, User, Cart, Search } from './Icons';

export default function Header() {
  const { user, setAuthOpen } = useAuth();
  const { count, wish, theme, toggleTheme } = useShop();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inp = useRef(null);
  const landing = pathname === '/';
  const over = landing && !scrolled && !drawer && !sOpen;

  useEffect(() => { setDrawer(false); setSOpen(false); }, [pathname]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 50);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    if (sOpen) setTimeout(() => inp.current && inp.current.focus(), 200);
    const esc = (e) => e.key === 'Escape' && setSOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [sOpen]);

  const submit = (e) => {
    e.preventDefault();
    setSOpen(false);
    if (q.trim()) nav('/search/' + encodeURIComponent(q.trim()) + (cat ? '?cat=' + cat : ''));
    else nav(cat ? '/c/' + cat : '/shop');
  };
  const account = () => (user ? nav('/account') : setAuthOpen(true));
  const on = (p) => (pathname === p ? 'on' : '');

  return (
    <>
    <div className={'hdr' + (over ? ' over' : '')}>
      <div className="ann"><div className="w annw">
        <span className="annl"><Link to="/orders">Order tracking</Link><Link to="/account">My account</Link></span>
        <span className="annc">Free delivery on orders above ₹499, across India</span>
        <span className="annr" onClick={() => nav('/account/addresses')}>Delivering to Chennai</span>
      </div></div>
      <header><div className="w hrow">
        <div className="hl">
          <button className="hmenu" onClick={() => setDrawer(true)} aria-label="Open menu"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 7h18M3 12h18M3 17h18" /></svg></button>
          <Link to="/" className="wm">NEXMART</Link>
        </div>
        <nav className="hn">
          <Link to="/shop" className={on('/shop')}>Shop</Link>
          <Link to="/deals" className={on('/deals')}>Hot deals</Link>
          {Object.entries(CATS).slice(0, 4).map(([k, v]) => <Link key={k} to={'/c/' + k} className={on('/c/' + k)}>{v}</Link>)}
          <button onClick={() => setDrawer(true)}>More</button>
        </nav>
        <div className="hr">
          <button className="ib" onClick={() => setSOpen(true)} aria-label="Search"><Search /></button>
          <button className="ib" onClick={toggleTheme} aria-label="Switch light or dark mode">{theme ? <Sun /> : <Moon />}</button>
          <button className="ib" onClick={() => nav('/wishlist')} aria-label="Wishlist"><Heart size={22} /><b>{wish.length}</b></button>
          <button className="ib" onClick={account} aria-label={user ? 'Account' : 'Sign in'} title={user ? 'Account' : 'Sign in'}><User /></button>
          <button className="ib" onClick={() => nav('/cart')} aria-label="Cart"><Cart /><b>{count}</b></button>
        </div>
      </div></header>
    </div>
    {!landing && <div className="hdr-sp" />}

    <div className={'dw-ov' + (sOpen ? ' on' : '')} onClick={() => setSOpen(false)} />
    <div className={'srch' + (sOpen ? ' on' : '')} aria-hidden={!sOpen}>
      <form className="w srch-f" onSubmit={submit}>
        <Search />
        <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands and more" aria-label="Search" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="">All</option>
          {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button type="submit" className="btn">Search</button>
        <button type="button" className="srch-x" onClick={() => setSOpen(false)} aria-label="Close search">✕</button>
      </form>
    </div>
    <CategoryDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}
