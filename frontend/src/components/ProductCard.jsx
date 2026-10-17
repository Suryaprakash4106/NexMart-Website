import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { inr, off, stars, deliveryBy, imgFallback } from '../utils/format';
import { Heart } from './Icons';

export default function ProductCard({ p }) {
  const nav = useNavigate();
  const { wish, toggleWish, addCart } = useShop();
  const mrp = p.originalPrice > p.price;
  const alt = (p.images || []).find((u) => u && u !== p.image);
  return (
    <div className="card" onClick={() => nav('/p/' + p.id)}>
      <div className="pimg">
        {p.deal && off(p) >= 15 && <span className="tag">Offer</span>}
        <button className={'hb' + (wish.includes(p.id) ? ' on' : '')} aria-label="Wishlist" onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}><Heart /></button>
        <img className="i1" src={p.image} alt={p.name} loading="lazy" onError={imgFallback} />
        {alt && <img className="i2" src={alt} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      </div>
      <div className="cb">
        <span className="br">{p.brand}</span>
        <div className="nm">{p.name}</div>
        <div className="st"><b>{stars(p.rating || 0)}</b> {p.reviews > 0 ? <span>{p.rating} ({p.reviews.toLocaleString()})</span> : <span>No ratings yet</span>}</div>
        <div className="pr"><sup>₹</sup>{Number(p.price).toLocaleString('en-IN')}</div>
        <div className="mrp">{mrp ? <>Was <s>{inr(p.originalPrice)}</s> <em>{off(p)}% off</em></> : '\u00A0'}</div>
        <div className="dl">{p.price >= 499 ? <>Free delivery by <b>{deliveryBy(3)}</b></> : <>₹49 delivery by <b>{deliveryBy(3)}</b></>}</div>
        <div className="bad stk">{p.stock === 0 ? 'Currently unavailable' : p.stock <= 5 ? 'Only ' + p.stock + ' left in stock' : '\u00A0'}</div>
        <div className="act"><button className="btn pill f" disabled={!p.stock} onClick={(e) => { e.stopPropagation(); addCart(p.id); }}>Add to cart</button></div>
      </div>
    </div>
  );
}
