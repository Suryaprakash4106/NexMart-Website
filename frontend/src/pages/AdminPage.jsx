import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import ProductForm from '../components/ProductForm';
import { inr } from '../utils/format';

const STATUS = ['Pending Payment', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminPage() {
  const { products, loadProducts, toast } = useShop();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');
  const [form, setForm] = useState(null); // null = closed, {} = new, product = edit

  const load = () => Promise.all([api('/admin/stats'), api('/admin/orders')]).then(([s, o]) => { setStats(s); setOrders(o.orders); }).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => { try { await api('/admin/orders/' + id, 'PATCH', { status }); toast('Status updated'); } catch (e) { toast(e.message); } };
  const del = async (id) => { if (!confirm('Delete this product?')) return; try { await api('/admin/products/' + id, 'DELETE'); await loadProducts(); } catch (e) { toast(e.message); } };

  if (err) return <div className="box" style={{ marginTop: 20 }}>{err}</div>;
  if (!stats) return <p style={{ margin: 20 }}>Loading…</p>;
  return (
    <>
      <h2 style={{ margin: '20px 0' }}>Admin dashboard</h2>
      <div className="kp">
        <div><b>{stats.orders}</b>Orders</div><div><b>{inr(stats.revenue)}</b>Revenue</div>
        <div><b>{stats.users}</b>Customers</div><div><b>{stats.lowStock.length}</b>Low stock</div>
      </div>
      <div className="box" style={{ overflow: 'auto' }}>
        <h3 style={{ marginBottom: 8 }}>Orders</h3>
        <table><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead><tbody>
          {orders.map((o) => (
            <tr key={o.orderId}><td>{o.orderId}</td><td>{o.user?.name || '-'}<br /><small>{o.address?.city}</small></td><td>{o.paid ? 'Paid' : o.payment}</td><td>{inr(o.total)}</td>
              <td><select className="in" style={{ width: 'auto' }} defaultValue={o.status} onChange={(e) => setStatus(o.orderId, e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></td></tr>
          ))}
        </tbody></table>
      </div>
      <div className="box" style={{ overflow: 'auto' }}>
        <div className="sp" style={{ marginBottom: 8 }}><h3>Products ({products.length})</h3><button className="btn" onClick={() => setForm({})}>Add product</button></div>
        <table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead><tbody>
          {products.map((p) => (
            <tr key={p.id}><td>{p.name}</td><td>{p.category}</td><td>{inr(p.price)}</td><td>{p.stock}</td>
              <td><a onClick={() => setForm(p)}>Edit</a> · <a onClick={() => del(p.id)}>Delete</a></td></tr>
          ))}
        </tbody></table>
      </div>
      {form && <ProductForm product={form.id ? form : null} toast={toast} onClose={() => setForm(null)} onSaved={async () => { setForm(null); await loadProducts(); load(); }} />}
    </>
  );
}
