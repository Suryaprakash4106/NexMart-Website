import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { inr, imgFallback } from '../utils/format';

export default function CartPage() {
  const { lines, subtotal, shipping, count, setQty, toggleWish } = useShop();
  const nav = useNavigate();
  return (
    <div className="lay" style={{ gridTemplateColumns: '1fr 300px', marginTop: 20 }}>
      <div className="box">
        <h2>Shopping cart</h2>
        {lines.length ? lines.map(({ product: p, qty }) => (
          <div className="ci" key={p.id}>
            <img src={p.image} alt="" onError={imgFallback} />
            <div>
              <Link to={'/p/' + p.id}><b>{p.name}</b></Link>
              <div className="ok" style={{ fontSize: 12 }}>In stock</div>
              <div style={{ marginTop: 8 }}>
                <select className="in" style={{ width: 'auto' }} value={qty} onChange={(e) => setQty(p.id, +e.target.value)}>
                  {Array.from({ length: Math.min(p.stock, 10) }, (_, i) => <option key={i}>{i + 1}</option>)}
                </select>
                <a onClick={() => setQty(p.id, 0)} style={{ marginLeft: 10 }}>Delete</a>
                <a onClick={() => { setQty(p.id, 0); toggleWish(p.id); }} style={{ marginLeft: 10 }}>Save for later</a>
              </div>
            </div>
            <b>{inr(p.price * qty)}</b>
          </div>
        )) : <p className="mu" style={{ margin: '14px 0' }}>Your cart is empty. <Link to="/">Continue shopping</Link></p>}
      </div>
      {lines.length > 0 && (
        <div className="box" style={{ alignSelf: 'start' }}>
          <p className="ok">{shipping ? 'Add ' + inr(499 - subtotal) + ' more for free delivery' : 'Your order qualifies for free delivery'}</p>
          <h3 style={{ margin: '8px 0 12px' }}>Subtotal ({count} items): {inr(subtotal)}</h3>
          <button className="btn f" onClick={() => nav('/checkout')}>Proceed to buy</button>
        </div>
      )}
    </div>
  );
}
