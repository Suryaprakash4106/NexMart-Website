import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Header from './components/Header';
import SceneBackdrop from './components/SceneBackdrop';
import StartupLoader from './components/StartupLoader';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import RequireAuth from './components/RequireAuth';
import { useShop } from './context/ShopContext';
import LandingPage from './pages/LandingPage';
import ListingPage from './pages/ListingPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import AccountPage from './pages/AccountPage';
import SecurityPage from './pages/SecurityPage';
import AddressesPage from './pages/AddressesPage';
import PaymentsPage from './pages/PaymentsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { pathname, search } = useLocation();
  const { products, isInitialLoading, loadError, theme } = useShop();
  const [bootReady, setBootReady] = useState(false);
  const [bootLeaving, setBootLeaving] = useState(false);
  const bootStartedAt = useRef(performance.now());
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    if (bootReady && pathname === '/') document.documentElement.dataset.page = 'home';
    else delete document.documentElement.dataset.page;
    return () => { delete document.documentElement.dataset.page; };
  }, [bootReady, pathname]);
  useEffect(() => {
    if (isInitialLoading || bootReady) return undefined;
    const waitForIntro = Math.max(0, 1250 - (performance.now() - bootStartedAt.current));
    const leaveTimer = window.setTimeout(() => setBootLeaving(true), waitForIntro);
    const readyTimer = window.setTimeout(() => setBootReady(true), waitForIntro + 520);
    return () => { window.clearTimeout(leaveTimer); window.clearTimeout(readyTimer); };
  }, [isInitialLoading, bootReady]);

  if (!bootReady) return <StartupLoader theme={theme} leaving={bootLeaving} />;

  const guard = (el, admin) => <RequireAuth admin={admin}>{el}</RequireAuth>;
  const lp = pathname === '/' && products.length > 0 && !loadError;
  const top = pathname === '/' ? 150 : 20;

  return (
    <>
      <SceneBackdrop isLanding={lp} />
      <Header />
      <main className={lp ? 'lpage' : 'w'}>
        {loadError ? <div className="box" style={{ marginTop: top }}>{loadError}</div>
          : !products.length ? <div className="grid" style={{ marginTop: top }}>{Array.from({ length: 10 }, (_, i) => <div key={i} className="sk" />)}</div>
          : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/shop" element={<ListingPage key={pathname} mode="all" />} />
              <Route path="/c/:cat" element={<ListingPage key={pathname + search} mode="category" />} />
              <Route path="/deals" element={<ListingPage key={pathname} mode="deals" />} />
              <Route path="/search/:q" element={<ListingPage key={pathname + search} mode="search" />} />
              <Route path="/p/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/checkout" element={guard(<CheckoutPage />)} />
              <Route path="/orders" element={guard(<OrdersPage />)} />
              <Route path="/account" element={guard(<AccountPage />)} />
              <Route path="/account/security" element={guard(<SecurityPage />)} />
              <Route path="/account/addresses" element={guard(<AddressesPage />)} />
              <Route path="/account/payments" element={guard(<PaymentsPage />)} />
              <Route path="/admin" element={guard(<AdminPage />, true)} />
              <Route path="*" element={<div className="box" style={{ marginTop: 20 }}>Page not found. <Link to="/">Go home</Link></div>} />
            </Routes>
          )}
      </main>
      <Footer />
      <AuthModal />
      <Toast />
    </>
  );
}
