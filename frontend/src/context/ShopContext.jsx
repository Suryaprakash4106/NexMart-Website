import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);
const read = (k) => JSON.parse(localStorage.getItem(k) || '[]');

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cart, setCart] = useState(() => read('nm_cart'));
  const [wish, setWish] = useState(() => read('nm_wish'));
  const [notification, setNotification] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('nm_theme') || '');
  const timer = useRef();
  const notificationId = useRef(0);
  const pendingConfirmation = useRef(null);
  const initialLoadComplete = useRef(false);

  const toast = useCallback((message, type) => {
    clearTimeout(timer.current);
    const text = String(message ?? '');
    const kind = type || (
      /could not|invalid|failed|error|only \d|out of stock|required|must be|enter a valid|not enough/i.test(text) ? 'error'
        : /cancel|expired|low stock/i.test(text) ? 'warning'
          : /welcome|added|saved|placed|updated|applied|uploaded|deleted|thank you|success/i.test(text) ? 'success' : 'info'
    );
    setNotification({ id: ++notificationId.current, message: text, type: kind });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotification(null), 4600);
  }, []);

  const dismissNotification = useCallback(() => {
    clearTimeout(timer.current);
    setNotification(null);
  }, []);

  const askConfirm = useCallback((options) => new Promise((resolve) => {
    if (pendingConfirmation.current) pendingConfirmation.current(false);
    pendingConfirmation.current = resolve;
    setConfirmation({
      title: options.title || 'Are you sure?',
      message: options.message || 'Please confirm this action.',
      confirmLabel: options.confirmLabel || 'Continue',
      cancelLabel: options.cancelLabel || 'Go back',
      danger: Boolean(options.danger),
    });
  }), []);

  const resolveConfirm = useCallback((accepted) => {
    const resolve = pendingConfirmation.current;
    pendingConfirmation.current = null;
    setConfirmation(null);
    resolve?.(accepted);
  }, []);

  const loadProducts = useCallback(async () => {
    const isFirstLoad = !initialLoadComplete.current;
    try {
      const response = await api('/products');
      if (!Array.isArray(response.products)) throw new Error('Invalid product response');
      setProducts(response.products);
      setLoadError('');
    } catch {
      setLoadError('Could not reach the server. Start the backend with "npm start" in the backend folder.');
    } finally {
      if (isFirstLoad) {
        initialLoadComplete.current = true;
        setIsInitialLoading(false);
      }
    }
  }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    document.documentElement.dataset.t = theme;
    localStorage.setItem('nm_theme', theme);
  }, [theme]);

  const byId = useCallback((id) => products.find((p) => p.id === id), [products]);

  // keep cart and wishlist saved on the server for signed-in users
  const saveCart = (c) => { setCart(c); localStorage.setItem('nm_cart', JSON.stringify(c)); if (user) api('/cart', 'PUT', { cart: c.map((x) => ({ productId: x.id, qty: x.qty })) }).catch(() => {}); };
  const saveWish = (w) => { setWish(w); localStorage.setItem('nm_wish', JSON.stringify(w)); if (user) api('/wishlist', 'PUT', { wishlist: w }).catch(() => {}); };

  useEffect(() => {
    if (!user || !products.length) return;
    (async () => {
      try {
        if (cart.length) await api('/cart', 'PUT', { cart: cart.map((x) => ({ productId: x.id, qty: x.qty })) });
        else { const c = await api('/cart'); setCart(c.cart.map((x) => ({ id: x.productId, qty: x.qty }))); }
        const w = await api('/wishlist');
        setWish((cur) => [...new Set([...cur, ...w.wishlist])]);
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line
  }, [user?.id, products.length]);

  const addCart = (id, n = 1, quiet) => {
    const p = byId(id); if (!p || p.stock < 1) return;
    const cur = cart.find((c) => c.id === id); const q = (cur ? cur.qty : 0) + n;
    if (q > p.stock) return toast('Only ' + p.stock + ' in stock');
    saveCart(cur ? cart.map((c) => (c.id === id ? { ...c, qty: q } : c)) : [...cart, { id, qty: n }]);
    if (!quiet) toast('Added to cart');
  };
  const setQty = (id, q) => saveCart(q ? cart.map((c) => (c.id === id ? { ...c, qty: q } : c)) : cart.filter((c) => c.id !== id));
  const clearCart = () => saveCart([]);
  const toggleWish = (id) => {
    const removing = wish.includes(id);
    saveWish(removing ? wish.filter((x) => x !== id) : [...wish, id]);
    toast(removing ? 'Removed from your wishlist' : 'Saved to your wishlist', removing ? 'info' : 'success');
  };

  const lines = cart.map((c) => ({ ...c, product: byId(c.id) })).filter((l) => l.product);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
  const shipping = !subtotal || subtotal >= 499 ? 0 : 49;
  const count = lines.reduce((a, l) => a + l.qty, 0);

  return (
    <ShopContext.Provider value={{ products, isInitialLoading, loadError, loadProducts, byId, cart, lines, subtotal, shipping, count, wish, addCart, setQty, clearCart, toggleWish, toast, notification, dismissNotification, confirmation, askConfirm, resolveConfirm, theme, toggleTheme: () => setTheme(theme ? '' : 'dark') }}>
      {children}
    </ShopContext.Provider>
  );
}
