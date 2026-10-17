import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductRow from '../components/ProductRow';
import Reviews from '../components/Reviews';
import Spin360 from '../components/Spin360';
import { Heart, Rotate } from '../components/Icons';
import { useShop } from '../context/ShopContext';
import { CATS, inr, off, stars, deliveryBy, imgFallback } from '../utils/format';

export default function ProductPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { byId, products, addCart, wish, toggleWish } = useShop();
  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState('desc');
  const [spin, setSpin] = useState(false);
  const [zoom, setZoom] = useState(null);
  useEffect(() => { setQty(1); setIdx(0); setTab('desc'); setSpin(false); }, [id]);

  const p = byId(+id);
  if (!p) return <div className="box" style={{ marginTop: 20 }}>Product not found.</div>;

  // main image first, no repeated photos
  const imgs = [...new Set([p.image, ...(p.images || [])].filter(Boolean))].slice(0, 8);
  const cur = imgs[Math.min(idx, imgs.length - 1)];
  const same = products.filter((x) => x.category === p.category && x.id !== p.id);
  const related = [...same.filter((x) => x.subcategory === p.subcategory), ...same.filter((x) => x.subcategory !== p.subcategory)].slice(0, 12);
  const bullets = p.features?.length ? p.features : [];
  const specs = p.specs?.length ? p.specs : [{ k: 'Brand', v: p.brand }, { k: 'Category', v: CATS[p.category] || p.category }, ...(p.subcategory ? [{ k: 'Type', v: p.subcategory }] : [])];
  const wished = wish.includes(p.id);

  const moveZoom = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <>
      <div className="crumb"><Link to="/">Home</Link> › <Link to={'/c/' + p.category}>{CATS[p.category] || p.category}</Link> › <Link to={'/c/' + p.category + '?sub=' + encodeURIComponent(p.subcategory || '')}>{p.subcategory || p.category}</Link> › {p.name}</div>
      <div className="pdp">
        <div className="pdp-gal">
          {imgs.length > 1 && (
            <div className="pdp-th">{imgs.map((m, k) => (
              <button key={m} className={k === idx ? 'on' : ''} onClick={() => setIdx(k)} aria-label={'Photo ' + (k + 1)}><img src={m} alt="" loading="lazy" onError={imgFallback} /></button>
            ))}</div>
          )}
          <div className="pdp-m" onMouseMove={moveZoom} onMouseLeave={() => setZoom(null)}>
            <img src={cur} alt={p.name} onError={imgFallback}
              style={zoom ? { transform: 'scale(1.9)', transformOrigin: zoom.x + '% ' + zoom.y + '%' } : undefined} />
            <button className="pdp-360" onClick={() => setSpin(true)}><Rotate size={16} /> 360° view</button>
          </div>
        </div>

        <div className="pdp-i">
          <Link className="br" to={'/search/' + encodeURIComponent(p.brand)}>{p.brand}</Link>
          <h1>{p.name}</h1>
          <div className="st"><b>{stars(p.rating || 0)}</b> {p.reviews > 0 ? <><span className="rt">{p.rating}</span><span>{p.reviews.toLocaleString()} ratings</span></> : <span>No ratings yet</span>}</div>
          <div className="pdp-p">
            <span className="pr">{inr(p.price)}</span>
            {p.originalPrice > p.price && <><s className="mu">{inr(p.originalPrice)}</s><em className="bad">{off(p)}% off</em></>}
          </div>
          <p className="mu" style={{ fontSize: 12.5, marginTop: -6 }}>Inclusive of all taxes</p>
          <p className="pdp-d">{p.description}</p>
          {bullets.length > 0 && <ul>{bullets.slice(0, 5).map((f) => <li key={f}>{f}</li>)}</ul>}
          <div className="pdp-s">
            <div className={p.stock ? 'ok' : 'bad'}>{p.stock ? (p.stock <= 5 ? 'Only ' + p.stock + ' left in stock' : 'In stock') : 'Out of stock'}</div>
            <div className={p.price >= 499 ? 'ok' : ''}>{p.price >= 499 ? 'Free delivery by ' : 'Delivery ₹49 by '}<b>{deliveryBy(3)}</b></div>
            <div className="mu">Same-day delivery in Chennai on eligible orders</div>
          </div>
          <div className="pdp-b">
            {p.stock > 0 && <select className="in" value={qty} onChange={(e) => setQty(+e.target.value)} aria-label="Quantity">{Array.from({ length: Math.min(p.stock, 10) }, (_, i) => <option key={i}>{i + 1}</option>)}</select>}
            {p.stock > 0 && <button className="btn" onClick={() => addCart(p.id, qty)}>Add to cart</button>}
            <button className={'heart-btn' + (wished ? ' on' : '')} onClick={() => toggleWish(p.id)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} title={wished ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={20} /></button>
            {p.stock > 0 && <button className="btn ln pdp-w" onClick={() => { addCart(p.id, qty, true); nav('/checkout'); }}>Buy now</button>}
          </div>
          <div className="mu" style={{ fontSize: 12 }}>Secure transaction and 7-day easy returns</div>
        </div>
      </div>

      <section className="tabs">
        <div className="tabs-h">
          {[['desc', 'Description'], ['spec', 'Specifications'], ['ship', 'Delivery and returns']].map(([k, v]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{v}</button>)}
        </div>
        <div className="tabs-b">
          {tab === 'desc' && (
            <div className="tb-d">
              <p>{p.description}</p>
              {bullets.length > 0 && <><h4>Highlights</h4><ul>{bullets.map((f) => <li key={f}>{f}</li>)}</ul></>}
            </div>
          )}
          {tab === 'spec' && <table className="pinfo"><tbody>{specs.map((s) => <tr key={s.k}><td>{s.k}</td><td>{s.v}</td></tr>)}</tbody></table>}
          {tab === 'ship' && (
            <div className="tb-d">
              <ul>
                <li>Free delivery on orders above ₹499, otherwise ₹49.</li>
                <li>Same-day delivery in Chennai on eligible orders, 2 to 5 days across India.</li>
                <li>7-day returns on eligible products, in original condition and packaging.</li>
                <li>Pay online or cash on delivery. Online payments are processed securely.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      <ProductRow title="Customers also viewed" items={related} />
      <Reviews key={p.id} product={p} />
      {spin && <Spin360 product={p} images={imgs} onClose={() => setSpin(false)} />}
    </>
  );
}
