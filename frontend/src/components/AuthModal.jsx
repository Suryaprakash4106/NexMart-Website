import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function AuthModal() {
  const { authOpen, setAuthOpen, authenticate } = useAuth();
  const { toast } = useShop();
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    try {
      const u = await authenticate(reg ? 'register' : 'login', f);
      toast('Welcome, ' + u.name.split(' ')[0]);
    } catch (e) { toast(e.message); }
  };
  return (
    <div className={'ov' + (authOpen ? ' on' : '')} onClick={(e) => e.target === e.currentTarget && setAuthOpen(false)}>
      <div className="md">
        <h2>{reg ? 'Create account' : 'Sign in'}</h2>
        {reg && <input className="in" placeholder="Full name" value={f.name} onChange={set('name')} />}
        <input className="in" type="email" placeholder="Email" value={f.email} onChange={set('email')} />
        {reg && <input className="in" placeholder="Mobile number" value={f.phone} onChange={set('phone')} />}
        <input className="in" type="password" placeholder="Password (8+ characters)" value={f.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <button className="btn f" onClick={submit}>{reg ? 'Create account' : 'Sign in'}</button>
        <button className="btn ln f" onClick={() => setReg(!reg)}>{reg ? 'I already have an account' : 'Create your NexMart account'}</button>
      </div>
    </div>
  );
}
