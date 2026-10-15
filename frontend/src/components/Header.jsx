import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { CATS } from '../utils/format';
import CategoryDrawer from './CategoryDrawer';
import { Sun, Moon, Heart, User, Box, Cart, Pin, Search } from './Icons';

export default function Header() {
  const { user, setAuthOpen } = useAuth();
  const { count, wish, theme, toggleTheme } = useShop();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  useEffect(() => { setDrawer(false); }, [pathname]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav('/search/' + encodeURIComponent(q.trim()) + (cat ? '?cat=' + cat : ''));
    else nav(cat ? '/c/' + cat : '/');
  };
  const account = () => (user ? nav('/account') : setAuthOpen(true));

  return (
    <>
    <header>
      <div className="h1"><div className="w">
        <button className="allbtn" onClick={() => setDrawer(true)} aria-label="Open menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h16" /></svg><em>Menu</em></button>
        <Link to="/" className="logo"><i>N</i>NexMart</Link>
        <Link to="/deals" className="hot">Hot deals</Link>
        <form className="sr" onSubmit={submit}>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
            <option value="">All</option>
            {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, brands and more" aria-label="Search" />
          <button aria-label="Search"><Search /></button>
        </form>
        <div className="loc" onClick={() => nav('/account/addresses')}>
          <Pin /><span><small>Delivering to</small><br /><b>Chennai</b></span>
        </div>
        <button className="ic" onClick={toggleTheme} aria-label="Switch light or dark mode">{theme ? <Sun /> : <Moon />}<span>{theme ? 'Light' : 'Dark'}</span></button>
        <button className="ic" onClick={account} aria-label="Account"><User /><span>{user ? 'Account' : 'Sign in'}</span></button>
        <button className="ic" onClick={() => nav('/orders')} aria-label="Orders"><Box /><span>Orders</span></button>
        <button className="ic" onClick={() => nav('/wishlist')} aria-label="Wishlist"><Heart size={22} /><span>Wishlist</span><b>{wish.length}</b></button>
        <button className="ic" onClick={() => nav('/cart')} aria-label="Cart"><Cart /><span>Cart</span><b>{count}</b></button>
      </div></div>
    </header>
    <CategoryDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}
