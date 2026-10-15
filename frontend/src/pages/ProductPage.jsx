import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductRow from '../components/ProductRow';
import Reviews from '../components/Reviews';
import { useShop } from '../context/ShopContext';
import { CATS, inr, off, stars, deliveryBy, imgFallback } from '../utils/format';

export default function ProductPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { byId, products, addCart, wish, toggleWish } = useShop();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState('');
  const p = byId(+id);
  if (!p) return <div className="box" style={{ marginTop: 20 }}>Product not found.</div>;
  const imgs = p.images?.length ? p.images : [p.image];
  const shown = img || imgs[0];
  const same = products.filter((x) => x.category === p.category && x.id !== p.id);
  const related = [...same.filter((x) => x.subcategory === p.subcategory), ...same.filter((x) => x.subcategory !== p.subcategory)].slice(0, 12);
  const bullets = p.features?.length ? p.features : [];

  return (
    <>
      <div className="crumb"><Link to="/">Home</Link> › <Link to={'/c/' + p.category}>{CATS[p.category] || p.category}</Link> › <Link to={'/c/' + p.category + '?sub=' + encodeURIComponent(p.subcategory || '')}>{p.subcategory}</Link></div>
      <div className="det">
        <div className="th">{imgs.slice(0, 6).map((m) => <img key={m} className={m === shown ? 'on' : ''} src={m} alt="" onClick={() => setImg(m)} onError={imgFallback} />)}</div>
        <div><img className="big" src={shown} alt={p.name} onError={imgFallback} /></div>
        <div>
          <Link className="br" to={'/search/' + encodeURIComponent(p.brand)}>Brand: {p.brand}</Link>
          <h1 style={{ fontSize: 24, lineHeight: 1.25, margin: '4px 0 8px' }}>{p.name}</h1>
          {p.reviews > 0 ? <div className="st">{p.rating} <b>{stars(p.rating)}</b> <span>{p.reviews.toLocaleString()} ratings</span></div> : <div className="mu">No ratings yet</div>}
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '12px 0' }} />
          {p.originalPrice > p.price && <span className="bad" style={{ fontSize: 24, fontWeight: 300 }}>−{off(p)}% </span>}
          <span className="pr" style={{ fontSize: 30 }}>{inr(p.price)}</span>
          {p.originalPrice > p.price && <div className="mu">Was <s>{inr(p.originalPrice)}</s></div>}
          <p className="mu" style={{ marginTop: 4 }}>Inclusive of all taxes</p>
          <h4 style={{ marginTop: 16 }}>About this item</h4>
          <p className="mu" style={{ margin: '4px 0' }}>{p.description}</p>
          {bullets.length > 0 && <ul>{bullets.map((f) => <li key={f}>{f}</li>)}</ul>}
        </div>
        <div className="bx">
          <div className="pr" style={{ fontSize: 26 }}>{inr(p.price)}</div>
          <div className={p.price >= 499 ? 'ok' : ''}>{p.price >= 499 ? 'FREE delivery' : 'Delivery ₹49'} <b>{deliveryBy(3)}</b></div>
          <div className="mu">Same-day delivery in Chennai on eligible orders</div>
          <div className={p.stock ? 'ok' : 'bad'} style={{ fontSize: 17 }}>{p.stock ? (p.stock <= 5 ? 'Only ' + p.stock + ' left in stock' : 'In stock') : 'Out of stock'}</div>
          {p.stock > 0 && (
            <>
              <select className="in" value={qty} onChange={(e) => setQty(+e.target.value)}>{Array.from({ length: Math.min(p.stock, 10) }, (_, i) => <option key={i}>{i + 1}</option>)}</select>
              <button className="btn pill f" onClick={() => addCart(p.id, qty)}>Add to cart</button>
              <button className="btn red pill f" onClick={() => { addCart(p.id, qty, true); nav('/checkout'); }}>Buy now</button>
            </>
          )}
          <button className="btn ln f" onClick={() => toggleWish(p.id)}>{wish.includes(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}</button>
          <div className="mu" style={{ fontSize: 12 }}>Secure transaction · 7-day easy returns</div>
        </div>
      </div>
      {p.specs?.length > 0 && (
        <section className="sec"><h2 style={{ marginBottom: 10 }}>Product information</h2>
          <table className="pinfo"><tbody>{p.specs.map((s) => <tr key={s.k}><td>{s.k}</td><td>{s.v}</td></tr>)}</tbody></table>
        </section>
      )}
      <ProductRow title="Customers also viewed" items={related} />
      <Reviews key={p.id} product={p} />
    </>
  );
}
