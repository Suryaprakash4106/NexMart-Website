import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Crumb } from './AccountPage';

const blank = { name: '', phone: '', addr: '', city: '', pin: '', state: 'Tamil Nadu' };

export default function AddressesPage() {
  const { user, setUser } = useAuth();
  const { toast } = useShop();
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const add = async () => { try { const r = await api('/users/addresses', 'POST', f); setUser({ ...user, addresses: r.addresses }); setF(blank); toast('Address saved'); } catch (e) { toast(e.message); } };
  const del = async (id) => { try { const r = await api('/users/addresses/' + id, 'DELETE'); setUser({ ...user, addresses: r.addresses }); } catch (e) { toast(e.message); } };
  const list = user.addresses || [];
  return (
    <div className="narrow">
      <Crumb page="My addresses" />
      <h1 style={{ marginBottom: 14 }}>My addresses</h1>
      <div className="box">
        <h3 style={{ marginBottom: 12 }}>Add a new address</h3>
        <div className="two"><input className="in" placeholder="Full name" value={f.name} onChange={set('name')} /><input className="in" placeholder="Mobile (10 digits)" value={f.phone} onChange={set('phone')} /></div>
        <input className="in" placeholder="House no., street, area" style={{ marginTop: 10 }} value={f.addr} onChange={set('addr')} />
        <div className="three" style={{ marginTop: 10 }}><input className="in" placeholder="City" value={f.city} onChange={set('city')} /><input className="in" placeholder="PIN code" maxLength={6} value={f.pin} onChange={set('pin')} /><input className="in" placeholder="State" value={f.state} onChange={set('state')} /></div>
        <button className="btn" style={{ marginTop: 14 }} onClick={add}>Save address</button>
      </div>
      <h3 style={{ margin: '20px 0 10px' }}>Saved addresses ({list.length})</h3>
      {list.length ? (
        <div className="hub">{list.map((a) => (
          <div className="box" key={a._id} style={{ marginBottom: 0 }}><b>{a.name}</b><br />{a.addr}<br />{a.city}, {a.state} {a.pin}<br />Phone: {a.phone}<br /><a onClick={() => del(a._id)}>Remove</a></div>
        ))}</div>
      ) : <div className="box mu">No saved addresses yet.</div>}
    </div>
  );
}
