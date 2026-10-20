import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import { CATS, inr } from '../utils/format';

const STATUS = ['Pending Payment', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const ROLES = ['user', 'support', 'manager', 'admin'];
const TABS = [
  { id: 'dashboard', label: 'Dashboard', perm: 'dashboard' },
  { id: 'orders', label: 'Orders', perm: 'orders' },
  { id: 'products', label: 'Products', perm: 'products' },
  { id: 'reviews', label: 'Reviews', perm: 'reviews' },
  { id: 'users', label: 'Users & roles', perm: 'users' },
  { id: 'activity', label: 'Activity log', perm: 'activity' },
];
const ACTIONS = {
  'order.status': 'Order status', 'orders.export': 'Orders exported', 'product.create': 'Product added',
  'product.update': 'Product edited', 'product.delete': 'Product deleted', 'product.stock': 'Stock updated',
  'review.delete': 'Review deleted', 'user.role': 'Role changed',
};

const short = (n) => (n >= 1e7 ? (n / 1e7).toFixed(1) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(1) + 'L' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(Math.round(n)));
const when = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const slug = (s) => String(s).toLowerCase().replace(/[^a-z]+/g, '-');
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null));

function useDebounced(v, ms = 350) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}

// loads one page of a list from the server; goes back to page 1 whenever the filters change
function usePaged(path, params, size = 15) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const seq = useRef(0);
  const key = JSON.stringify(params);
  useEffect(() => { setPage(1); }, [key]);
  const load = useCallback(() => {
    const id = ++seq.current;
    setBusy(true);
    return api(path + '?' + new URLSearchParams({ ...clean(params), page, limit: size }).toString())
      .then((d) => { if (id === seq.current) { setData(d); setErr(''); } })
      .catch((e) => { if (id === seq.current) setErr(e.message); })
      .finally(() => { if (id === seq.current) setBusy(false); });
  }, [path, key, page, size]); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  return { data, busy, err, page, setPage, reload: load, setData };
}

function Pager({ page, pages, total, set }) {
  return (
    <div className="ad-pg">
      <span className="mu">{total} total</span>
      <div>
        <button className="btn ln" disabled={page <= 1} onClick={() => set(page - 1)}>Prev</button>
        <b>{page} / {pages}</b>
        <button className="btn ln" disabled={page >= pages} onClick={() => set(page + 1)}>Next</button>
      </div>
    </div>
  );
}

function Bars({ data }) {
  const W = 700, H = 190, L = 46, T = 10;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (W - L) / data.length;
  const y = (v) => T + (H - T) * (1 - v / max);
  return (
    <svg className="ad-chart" viewBox={`0 0 ${W} ${H + 22}`} role="img" aria-label="Last 30 days">
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={L} x2={W} y1={y(max * g)} y2={y(max * g)} />
          <text x={L - 6} y={y(max * g) + 4} textAnchor="end">{short(max * g)}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <g key={i}>
          <rect x={L + i * bw + 2} y={y(d.value)} width={Math.max(2, bw - 4)} height={H - y(d.value)}><title>{d.tip}</title></rect>
          {i % 5 === 0 && <text x={L + i * bw + bw / 2} y={H + 16} textAnchor="middle">{d.label}</text>}
        </g>
      ))}
    </svg>
  );
}

function HBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="mu">No data yet</p>;
  return (
    <div className="ad-hb">
      {rows.map((r) => (
        <div key={r.label} className="ad-hbr">
          <span className="ad-hbl" title={r.label}>{r.label}</span>
          <i><b style={{ width: (r.value / max) * 100 + '%' }} /></i>
          <em>{r.sub ?? r.value}</em>
        </div>
      ))}
    </div>
  );
}

/* ---------------- dashboard ---------------- */
function Dashboard({ can, go }) {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  const [metric, setMetric] = useState(can('revenue') ? 'revenue' : 'orders');
  useEffect(() => { api('/admin/stats').then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="box">{err}</div>;
  if (!s) return <p className="mu">Loading…</p>;

  const today = s.daily[s.daily.length - 1] || { orders: 0, revenue: 0 };
  const week = s.daily.slice(-7).reduce((a, d) => ({ orders: a.orders + d.orders, revenue: a.revenue + (d.revenue || 0) }), { orders: 0, revenue: 0 });
  const series = s.daily.map((d) => ({
    label: d.date.slice(5), value: metric === 'revenue' ? d.revenue || 0 : d.orders,
    tip: `${d.date}: ${metric === 'revenue' ? inr(d.revenue || 0) : d.orders + ' orders'}`,
  }));
  const status = STATUS.map((n) => ({ label: n, value: s.byStatus.find((x) => x._id === n)?.count || 0 })).filter((r) => r.value);

  return (
    <>
      <div className="ad-kp">
        <div><span>Orders</span><b>{s.orders}</b><small>Today {today.orders} · 7 days {week.orders}</small></div>
        {can('revenue') && <div><span>Revenue</span><b>{inr(s.revenue)}</b><small>Today {inr(today.revenue)} · 7 days {inr(week.revenue)}</small></div>}
        <div><span>Customers</span><b>{s.users}</b><small>Registered accounts</small></div>
        <div><span>Low stock</span><b>{s.lowCount}</b><small>5 or fewer left</small></div>
      </div>

      <div className="ad-grid">
        <div className="box">
          <div className="ad-tt">
            <h3>Last 30 days</h3>
            {can('revenue') && (
              <div className="ad-seg">
                <button className={metric === 'revenue' ? 'on' : ''} onClick={() => setMetric('revenue')}>Revenue</button>
                <button className={metric === 'orders' ? 'on' : ''} onClick={() => setMetric('orders')}>Orders</button>
              </div>
            )}
          </div>
          <Bars data={series} />
        </div>
        <div className="box">
          <div className="ad-tt"><h3>Orders by status</h3></div>
          <HBars rows={status} />
        </div>
      </div>

      <div className="ad-grid ad-grid2">
        <div className="box">
          <div className="ad-tt"><h3>Top selling products</h3></div>
          <HBars rows={s.top.map((t) => ({ label: t.name, value: t.qty, sub: `${t.qty} sold${t.revenue != null ? ' · ' + inr(t.revenue) : ''}` }))} />
        </div>
        <div className="box">
          <div className="ad-tt">
            <h3>Low stock alerts</h3>
            {can('products') && <button className="btn ln" onClick={() => go('products')}>Manage stock</button>}
          </div>
          {s.lowStock.length ? s.lowStock.map((p) => (
            <div key={p.pid} className="ad-low"><span>{p.name}</span><b className={p.stock === 0 ? 'bad' : 'ad-warn'}>{p.stock === 0 ? 'Out of stock' : p.stock + ' left'}</b></div>
          )) : <p className="mu">All products are well stocked.</p>}
        </div>
      </div>
    </>
  );
}

/* ---------------- orders ---------------- */
function Orders({ canEdit, canExport }) {
  const { toast } = useShop();
  const [f, setF] = useState({ search: '', status: '', payment: '', from: '', to: '' });
  const search = useDebounced(f.search);
  const params = { search, status: f.status, payment: f.payment, from: f.from, to: f.to };
  const { data, err, page, setPage, reload, setData } = usePaged('/admin/orders', params);
  const [open, setOpen] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const setStatus = async (o, status) => {
    try {
      const d = await api('/admin/orders/' + o.orderId, 'PATCH', { status });
      setData((x) => ({ ...x, orders: x.orders.map((r) => (r.orderId === o.orderId ? { ...r, status: d.order.status, paid: d.order.paid } : r)) }));
      toast('Status updated');
    } catch (e) { toast(e.message); reload(); }
  };

  const exportCsv = async () => {
    try {
      const d = await api('/admin/orders/export?' + new URLSearchParams(clean(params)).toString());
      const blob = new Blob(['\ufeff' + d.csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'nexmart-orders-' + new Date().toISOString().slice(0, 10) + '.csv';
      a.click();
      URL.revokeObjectURL(a.href);
      toast(d.count + ' orders exported');
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="ad-bar">
        <input className="in" placeholder="Search order ID, name, email, phone, city" value={f.search} onChange={set('search')} />
        <select className="in" value={f.status} onChange={set('status')}><option value="">All status</option>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="in" value={f.payment} onChange={set('payment')}><option value="">All payments</option><option value="cod">Cash on delivery</option><option value="razorpay">Online</option></select>
        <input className="in" type="date" value={f.from} onChange={set('from')} title="From date" />
        <input className="in" type="date" value={f.to} onChange={set('to')} title="To date" />
        {Object.values(f).some(Boolean) && <button className="btn ln" onClick={() => setF({ search: '', status: '', payment: '', from: '', to: '' })}>Clear</button>}
        {canExport && <button className="btn" onClick={exportCsv}>Export CSV</button>}
      </div>
      {err && <div className="box">{err}</div>}
      <div className="box ad-tw">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Total</th><th>Status</th><th /></tr></thead>
          <tbody>
            {data?.orders.map((o) => (
              <Fragment key={o.orderId}>
                <tr className="ad-row" onClick={() => setOpen(open === o.orderId ? '' : o.orderId)}>
                  <td><b>{o.orderId}</b><br /><small className="mu">{when(o.createdAt)}</small></td>
                  <td>{o.user?.name || o.address?.name || '-'}<br /><small className="mu">{o.user?.email || o.address?.phone}</small></td>
                  <td>{o.payment === 'cod' ? 'COD' : 'Online'}<br /><small className={o.paid ? 'ok' : 'mu'}>{o.paid ? 'Paid' : 'Unpaid'}</small></td>
                  <td>{inr(o.total)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {canEdit && o.status !== 'Cancelled'
                      ? <select className="in ad-sel" value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                      : <span className={'ad-st ad-st-' + slug(o.status)}>{o.status}</span>}
                  </td>
                  <td className="ad-arrow">{open === o.orderId ? '▲' : '▼'}</td>
                </tr>
                {open === o.orderId && (
                  <tr className="ad-det"><td colSpan="6">
                    <div className="ad-detg">
                      <div>
                        {o.items.map((it, i) => (
                          <div key={i} className="ad-item">
                            {it.image && <img src={it.image} alt="" />}
                            <span>{it.name} <small className="mu">× {it.qty}</small></span>
                            <b>{inr(it.price * it.qty)}</b>
                          </div>
                        ))}
                      </div>
                      <div className="ad-addr">
                        <b>Deliver to</b><br />
                        {o.address?.name}, {o.address?.phone}<br />
                        {o.address?.addr}, {o.address?.city}, {o.address?.state} {o.address?.pin}
                        <hr />
                        Subtotal {inr(o.subtotal)} · Shipping {inr(o.shipping)} · Discount −{inr(o.discount)}{o.coupon ? ` (${o.coupon})` : ''}<br />
                        <b>Total {inr(o.total)}</b>
                      </div>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
            {data && !data.orders.length && <tr><td colSpan="6" className="mu">No orders found</td></tr>}
          </tbody>
        </table>
        {!data && <p className="mu">Loading…</p>}
      </div>
      {data && <Pager page={page} pages={data.pages} total={data.total} set={setPage} />}
    </>
  );
}

/* ---------------- products and stock ---------------- */
function StockCell({ p, onSave }) {
  const [v, setV] = useState(String(p.stock));
  useEffect(() => { setV(String(p.stock)); }, [p.stock]);
  const dirty = v !== String(p.stock);
  return (
    <span className="ad-stock">
      <input className="in" type="number" min="0" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dirty && onSave(p, v)} />
      {dirty && <button className="btn" onClick={() => onSave(p, v)}>Save</button>}
    </span>
  );
}

function Products() {
  const { products, loadProducts, toast } = useShop();
  const [f, setF] = useState({ search: '', category: '', stock: '' });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null = closed, {} = new, product = edit
  const search = useDebounced(f.search);
  const SIZE = 15;

  const list = products.filter((p) =>
    (!search || (p.name + ' ' + (p.brand || '')).toLowerCase().includes(search.toLowerCase())) &&
    (!f.category || p.category === f.category) &&
    (!f.stock || (f.stock === 'out' ? p.stock <= 0 : p.stock > 0 && p.stock <= 5)));
  const pages = Math.max(1, Math.ceil(list.length / SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * SIZE, cur * SIZE);
  const low = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const out = products.filter((p) => p.stock <= 0).length;
  useEffect(() => { setPage(1); }, [search, f.category, f.stock]);

  const saveStock = async (p, v) => {
    const n = Math.floor(Number(v));
    if (!Number.isFinite(n) || n < 0) return toast('Enter a valid stock number');
    try { await api(`/admin/products/${p.id}/stock`, 'PATCH', { stock: n }); await loadProducts(); toast('Stock updated'); } catch (e) { toast(e.message); }
  };
  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try { await api('/admin/products/' + p.id, 'DELETE'); await loadProducts(); toast('Product deleted'); } catch (e) { toast(e.message); }
  };

  return (
    <>
      <div className="ad-kp">
        <div><span>Products</span><b>{products.length}</b></div>
        <div><span>Low stock</span><b>{low}</b></div>
        <div><span>Out of stock</span><b>{out}</b></div>
      </div>
      <div className="ad-bar">
        <input className="in" placeholder="Search product or brand" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
        <select className="in" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="">All categories</option>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select>
        <select className="in" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })}><option value="">All stock</option><option value="low">Low stock (1 to 5)</option><option value="out">Out of stock</option></select>
        <button className="btn" onClick={() => setForm({})}>Add product</button>
      </div>
      <div className="box ad-tw">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><div className="ad-pn">{p.image && <img src={p.image} alt="" />}<span>{p.name}<br /><small className="mu">{p.brand}</small></span></div></td>
                <td>{p.category}</td>
                <td>{inr(p.price)}</td>
                <td><StockCell p={p} onSave={saveStock} /></td>
                <td><a onClick={() => setForm(p)}>Edit</a> · <a onClick={() => del(p)}>Delete</a></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5" className="mu">No products found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager page={cur} pages={pages} total={list.length} set={setPage} />
      {form && <ProductForm product={form.id ? form : null} toast={toast} onClose={() => setForm(null)} onSaved={async () => { setForm(null); await loadProducts(); }} />}
    </>
  );
}

/* ---------------- reviews ---------------- */
function Reviews() {
  const { toast } = useShop();
  const [f, setF] = useState({ search: '', rating: '' });
  const search = useDebounced(f.search);
  const { data, err, page, setPage, reload } = usePaged('/admin/reviews', { search, rating: f.rating }, 10);
  const del = async (r) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api('/admin/reviews/' + r._id, 'DELETE'); toast('Review deleted'); reload(); } catch (e) { toast(e.message); }
  };
  return (
    <>
      <div className="ad-bar">
        <input className="in" placeholder="Search customer or review text" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
        <select className="in" value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })}><option value="">All ratings</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select>
      </div>
      {err && <div className="box">{err}</div>}
      <div className="box">
        {!data && <p className="mu">Loading…</p>}
        {data?.reviews.map((r) => (
          <div key={r._id} className="ad-rv">
            <div className="ad-rvh">
              <span className="ad-stars">{stars(r.rating)}</span>
              <b>{r.userName || 'Customer'}</b>
              {r.verified && <small className="ok">Verified buyer</small>}
              {r.sample && <small className="mu">Sample</small>}
              <small className="mu">{when(r.createdAt)}</small>
              <button className="btn ln" onClick={() => del(r)}>Delete</button>
            </div>
            <div className="mu">on {r.productName}</div>
            {r.title && <b>{r.title}</b>}
            {r.comment && <p>{r.comment}</p>}
          </div>
        ))}
        {data && !data.reviews.length && <p className="mu">No reviews found</p>}
      </div>
      {data && <Pager page={page} pages={data.pages} total={data.total} set={setPage} />}
    </>
  );
}

/* ---------------- users and roles ---------------- */
function Users() {
  const { toast } = useShop();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const q = useDebounced(search);
  const { data, err, page, setPage, setData } = usePaged('/admin/users', { search: q, role });
  const change = async (u, r) => {
    if (!window.confirm(`Change ${u.name} to ${r}?`)) return;
    try {
      await api(`/admin/users/${u._id}/role`, 'PATCH', { role: r });
      setData((d) => ({ ...d, users: d.users.map((x) => (x._id === u._id ? { ...x, role: r } : x)) }));
      toast('Role updated');
    } catch (e) { toast(e.message); }
  };
  return (
    <>
      <div className="box ad-legend">
        <div><b>Admin</b> Everything, including roles and the activity log</div>
        <div><b>Manager</b> Products, stock, orders (change status), CSV export, reviews</div>
        <div><b>Support</b> View orders, moderate reviews</div>
        <div><b>User</b> Normal customer, no admin access</div>
      </div>
      <div className="ad-bar">
        <input className="in" placeholder="Search name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="in" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
      </div>
      {err && <div className="box">{err}</div>}
      <div className="box ad-tw">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Mobile</th><th>Joined</th><th>Role</th></tr></thead>
          <tbody>
            {data?.users.map((u) => {
              const me = String(u._id) === String(user.id);
              return (
                <tr key={u._id}>
                  <td>{u.name}{me && <small className="mu"> (you)</small>}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{when(u.createdAt)}</td>
                  <td><select className="in ad-sel" value={u.role} disabled={me} title={me ? 'You cannot change your own role' : ''} onChange={(e) => change(u, e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td>
                </tr>
              );
            })}
            {data && !data.users.length && <tr><td colSpan="5" className="mu">No users found</td></tr>}
          </tbody>
        </table>
        {!data && <p className="mu">Loading…</p>}
      </div>
      {data && <Pager page={page} pages={data.pages} total={data.total} set={setPage} />}
    </>
  );
}

/* ---------------- activity log ---------------- */
function Activity() {
  const { data, err, page, setPage } = usePaged('/admin/activity', {}, 25);
  return (
    <>
      {err && <div className="box">{err}</div>}
      <div className="box ad-tw">
        <table>
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>
            {data?.items.map((a) => (
              <tr key={a._id}>
                <td>{when(a.createdAt)}</td>
                <td>{a.userName} <small className="ad-role-s">{a.role}</small></td>
                <td>{ACTIONS[a.action] || a.action}</td>
                <td>{a.target}</td>
                <td className="mu">{a.detail}</td>
              </tr>
            ))}
            {data && !data.items.length && <tr><td colSpan="5" className="mu">No activity yet</td></tr>}
          </tbody>
        </table>
        {!data && <p className="mu">Loading…</p>}
      </div>
      {data && <Pager page={page} pages={data.pages} total={data.total} set={setPage} />}
    </>
  );
}

/* ---------------- page ---------------- */
export default function AdminPage() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState(() => { try { return sessionStorage.getItem('ad_tab') || 'dashboard'; } catch { return 'dashboard'; } });
  useEffect(() => { api('/admin/me').then(setMe).catch((e) => setErr(e.message)); }, []);
  const pick = (t) => { setTab(t); try { sessionStorage.setItem('ad_tab', t); } catch { /* ignore */ } };

  if (err) return <div className="box" style={{ marginTop: 20 }}>{err}</div>;
  if (!me) return <p style={{ margin: 20 }}>Loading…</p>;
  const can = (p) => me.perms.includes(p);
  const tabs = TABS.filter((t) => can(t.perm));
  const cur = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  return (
    <div className="ad">
      <div className="ad-head">
        <div>
          <h1>Admin</h1>
          <div className="ad-who"><span className="ad-role">{me.role}</span>{me.name}</div>
        </div>
      </div>
      <div className="ad-tabs">{tabs.map((t) => <button key={t.id} className={cur === t.id ? 'on' : ''} onClick={() => pick(t.id)}>{t.label}</button>)}</div>
      {cur === 'dashboard' && <Dashboard can={can} go={pick} />}
      {cur === 'orders' && <Orders canEdit={can('orders.edit')} canExport={can('orders.export')} />}
      {cur === 'products' && <Products />}
      {cur === 'reviews' && <Reviews />}
      {cur === 'users' && <Users />}
      {cur === 'activity' && <Activity />}
    </div>
  );
}