import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Lock, Pin, Card, Heart, Dash } from '../components/Icons';

const STAFF = {
  admin: 'Orders, products, users and sales',
  manager: 'Orders, products, stock and reviews',
  support: 'View orders and moderate reviews',
};

const Tile = ({ icon, title, text, to }) => {
  const nav = useNavigate();
  return <div className="tile" onClick={() => nav(to)}>{icon}<div><b>{title}</b><span className="mu">{text}</span></div></div>;
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="narrow">
      <div className="crumb">My account</div>
      <h1 style={{ marginBottom: 4 }}>My account</h1>
      <p className="mu" style={{ marginBottom: 16 }}>{user.name} · {user.email}</p>
      <div className="hub">
        <Tile icon={<Box size={40} sw={1.6} />} title="My orders" text="Track, cancel or view past orders" to="/orders" />
        <Tile icon={<Lock />} title="Login and security" text="Edit name, mobile and password" to="/account/security" />
        <Tile icon={<Pin size={40} sw={1.6} />} title="My addresses" text="Manage delivery addresses" to="/account/addresses" />
        <Tile icon={<Card />} title="Payment options" text="How you can pay on NexMart" to="/account/payments" />
        <Tile icon={<Heart size={40} />} title="My wishlist" text="Items you saved for later" to="/wishlist" />
        {STAFF[user.role] && <Tile icon={<Dash />} title="Admin dashboard" text={STAFF[user.role]} to="/admin" />}
      </div>
      <button className="btn ln" style={{ marginTop: 20 }} onClick={() => { logout(); nav('/'); }}>Sign out</button>
    </div>
  );
}

export const Crumb = ({ page }) => <div className="crumb"><Link to="/account">My account</Link> › {page}</div>;