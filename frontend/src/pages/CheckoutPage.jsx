import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, loadRazorpay } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { inr } from '../utils/format';

export default function CheckoutPage() {
  const { user, setUser } = useAuth();
  const { lines, subtotal, shipping, clearCart, toast } = useShop();
  const nav = useNavigate();
  const empty = { name: user?.name || '', phone: user?.phone || '', addr: '', city: '', state: 'Tamil Nadu', pin: '' };
  const [a, setA] = useState(empty);
  const [save, setSave] = useState(false);
  const [pay, setPay] = useState('online');
  const [code, setCode] = useState('');
  const [disc, setDisc] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setA({ ...a, [k]: e.target.value });
  const total = subtotal + shipping - disc;

  if (done) return (
    <div className="box" style={{ textAlign: 'center', marginTop: 30 }}>
      <h2>Order placed, thank you!</h2>
      <p style={{ margin: '8px 0 16px' }}>Order <b>{done.orderId}</b> for {inr(done.total)} {done.paid ? 'is paid.' : 'will be paid on delivery.'}</p>
      <button className="btn dk" onClick={() => nav('/orders')}>View your orders</button>
    </div>
  );
  if (!lines.length) return <Navigate to="/cart" replace />;

  const applyCoupon = async () => {
    try { const d = await api('/coupons/check', 'POST', { code, subtotal }); setDisc(d.discount); toast('Coupon applied'); }
    catch (e) { setDisc(0); toast(e.message); }
  };
  const finish = async (order) => { clearCart(); setDone(order); };

  const place = async () => {
    setBusy(true);
    try {
      const body = { items: lines.map((l) => ({ productId: l.id, qty: l.qty })), address: a, coupon: disc ? code : '' };
      if (save) { try { const r = await api('/users/addresses', 'POST', a); setUser({ ...user, addresses: r.addresses }); } catch { /* ignore */ } }
      if (pay === 'cod') { const d = await api('/orders', 'POST', body); return finish(d.order); }
      const d = await api('/payments/create', 'POST', body);
      await loadRazorpay();
      new window.Razorpay({
        key: d.key, amount: d.amount, currency: 'INR', order_id: d.rzpOrderId, name: 'NexMart', description: 'Order ' + d.orderId,
        prefill: { name: a.name, email: user.email, contact: a.phone }, theme: { color: '#5c1a1b' },
        handler: async (r) => { try { const v = await api('/payments/verify', 'POST', { orderId: d.orderId, ...r }); finish(v.order); } catch (e) { toast(e.message); } },
        modal: { ondismiss: () => { api('/payments/cancel', 'POST', { orderId: d.orderId }).catch(() => {}); setBusy(false); toast('Payment cancelled'); } },
      }).open();
    } catch (e) { toast(e.message); setBusy(false); }
  };

  return (
    <div className="lay" style={{ gridTemplateColumns: '1fr 340px', marginTop: 20 }}>
      <div>
        <div className="box">
          <h3 style={{ marginBottom: 10 }}>1. Delivery address</h3>
          {user.addresses?.length > 0 && (
            <select className="in" style={{ marginBottom: 10 }} onChange={(e) => setA(e.target.value === '' ? empty : { ...user.addresses[e.target.value] })}>
              <option value="">Enter a new address</option>
              {user.addresses.map((x, i) => <option key={x._id} value={i}>{x.name}, {x.addr}, {x.city} {x.pin}</option>)}
            </select>
          )}
          <div className="two"><input className="in" placeholder="Full name" value={a.name} onChange={set('name')} /><input className="in" placeholder="Mobile (10 digits)" value={a.phone} onChange={set('phone')} /></div>
          <input className="in" placeholder="House no., street, area" style={{ margin: '10px 0' }} value={a.addr} onChange={set('addr')} />
          <div className="two"><input className="in" placeholder="City" value={a.city} onChange={set('city')} /><input className="in" placeholder="PIN code" maxLength={6} value={a.pin} onChange={set('pin')} /></div>
          <input className="in" placeholder="State" style={{ marginTop: 10 }} value={a.state} onChange={set('state')} />
          <label style={{ display: 'flex', gap: 8, marginTop: 10 }}><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save this address to my account</label>
        </div>
        <div className="box pay">
          <h3 style={{ marginBottom: 10 }}>2. Payment method</h3>
          <label><input type="radio" name="pm" checked={pay === 'online'} onChange={() => setPay('online')} /><div><b>UPI, cards and net banking</b><br /><span className="mu">Pay securely online with Razorpay</span></div></label>
          <label><input type="radio" name="pm" checked={pay === 'cod'} onChange={() => setPay('cod')} /><div><b>Cash on delivery</b><br /><span className="mu">Pay when your order arrives</span></div></label>
        </div>
      </div>
      <div className="box" style={{ alignSelf: 'start' }}>
        <h3 style={{ marginBottom: 10 }}>Order summary</h3>
        {lines.map((l) => <div className="sp" key={l.id}><span>{l.product.name} × {l.qty}</span><span>{inr(l.product.price * l.qty)}</span></div>)}
        <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '10px 0' }} />
        <div className="sp"><input className="in" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} /><button className="btn ln" onClick={applyCoupon}>Apply</button></div>
        <div className="sp" style={{ marginTop: 10 }}><span>Delivery</span><span>{shipping ? inr(shipping) : 'Free'}</span></div>
        {disc > 0 && <div className="sp ok"><span>Discount</span><span>−{inr(disc)}</span></div>}
        <div className="sp" style={{ fontSize: 19, fontWeight: 800, margin: '10px 0' }}><span>Order total</span><span>{inr(total)}</span></div>
        <button className="btn f" disabled={busy} onClick={place}>Place your order</button>
      </div>
    </div>
  );
}
