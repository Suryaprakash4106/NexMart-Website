import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { inr } from '../utils/format';

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');
  const { toast, loadProducts } = useShop();
  const load = () => api('/orders').then((d) => setOrders(d.orders)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try { await api('/orders/' + id + '/cancel', 'POST'); await loadProducts(); toast('Order cancelled'); load(); } catch (e) { toast(e.message); }
  };
  return (
    <div className="narrow">
      <h2 style={{ margin: '20px 0' }}>My orders</h2>
      {err && <div className="box">{err}</div>}
      {!orders && !err && 'Loading…'}
      {orders && !orders.length && <div className="box">You have not placed any orders yet.</div>}
      {orders && orders.map((o) => {
        const k = STEPS.indexOf(o.status);
        return (
          <div className="box" key={o.orderId}>
            <div className="sp">
              <div><b>Order #{o.orderId}</b><br /><span className="mu">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.paid ? 'Paid online' : 'Pay on delivery'}</span></div>
              <b>{inr(o.total)}</b>
            </div>
            {o.status === 'Cancelled' ? <p className="bad" style={{ margin: '10px 0' }}>Cancelled</p> : (
              <><div className="trk">{STEPS.map((s, i) => <i key={s} className={i <= k ? 'on' : ''} />)}</div><p className="ok">{o.status}</p></>
            )}
            {o.items.map((i) => (
              <div className="ci" key={i.productId}><img src={i.image} alt="" /><div><Link to={'/p/' + i.productId}>{i.name}</Link><br />Qty {i.qty} · {inr(i.price * i.qty)}</div></div>
            ))}
            {['Placed', 'Processing'].includes(o.status) && <button className="btn ln" style={{ marginTop: 10 }} onClick={() => cancel(o.orderId)}>Cancel order</button>}
          </div>
        );
      })}
    </div>
  );
}
