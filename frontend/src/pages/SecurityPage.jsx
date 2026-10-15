import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { Crumb } from './AccountPage';

export default function SecurityPage() {
  const { user, setUser } = useAuth();
  const { toast } = useShop();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');

  const save = async () => { try { const d = await api('/users/me', 'PUT', { name, phone }); setUser({ ...user, ...d.user }); toast('Profile updated'); } catch (e) { toast(e.message); } };
  const pass = async () => { try { await api('/users/password', 'PUT', { current: cur, next }); setCur(''); setNext(''); toast('Password updated'); } catch (e) { toast(e.message); } };
  return (
    <div className="narrow">
      <Crumb page="Login and security" />
      <h1 style={{ marginBottom: 14 }}>Login and security</h1>
      <div className="two" style={{ alignItems: 'start', gap: 16 }}>
        <div className="box">
          <h3 style={{ marginBottom: 12 }}>Your details</h3>
          <label>Name</label><input className="in" value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ display: 'block', marginTop: 10 }}>Mobile</label><input className="in" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label style={{ display: 'block', marginTop: 10 }}>Email</label><input className="in" value={user.email} disabled />
          <button className="btn" style={{ marginTop: 14 }} onClick={save}>Save changes</button>
        </div>
        <div className="box">
          <h3 style={{ marginBottom: 12 }}>Change password</h3>
          <label>Current password</label><input className="in" type="password" value={cur} onChange={(e) => setCur(e.target.value)} />
          <label style={{ display: 'block', marginTop: 10 }}>New password</label><input className="in" type="password" placeholder="8+ characters" value={next} onChange={(e) => setNext(e.target.value)} />
          <button className="btn dk" style={{ marginTop: 14 }} onClick={pass}>Update password</button>
        </div>
      </div>
    </div>
  );
}
