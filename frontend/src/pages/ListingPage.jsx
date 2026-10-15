import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { CATS, PRICE_RANGES, off } from '../utils/format';

const SORTS = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, off: (a, b) => off(b) - off(a) };
const count = (list, key) => list.reduce((m, p) => { m[p[key]] = (m[p[key]] || 0) + 1; return m; }, {});

export default function ListingPage({ mode }) {
  const { cat, q } = useParams();
  const [sp] = useSearchParams();
  const sub = sp.get('sub') || '';
  const { products } = useShop();
  const [sort, setSort] = useState('default');
  const [price, setPrice] = useState('');
  const [rate, setRate] = useState(0);
  const [brands, setBrands] = useState([]);
  const [inStock, setInStock] = useState(false);

  let title, base, subs = {};
  if (mode === 'category') {
    const all = products.filter((p) => p.category === cat);
    subs = count(all, 'subcategory');
    base = sub ? all.filter((p) => p.subcategory === sub) : all;
    title = (CATS[cat] || cat) + (sub ? ' › ' + sub : '');
  } else if (mode === 'deals') { title = 'Hot deals'; base = products.filter((p) => p.deal); }
  else {
    const term = (q || '').toLowerCase(), c = sp.get('cat');
    title = '"' + q + '"';
    base = products.filter((p) => (!c || p.category === c) && ((p.name || '') + (p.brand || '') + (p.category || '') + (p.subcategory || '') + (p.description || '')).toLowerCase().includes(term));
  }
  let list = base.filter((p) => (!rate || p.rating >= rate) && (!brands.length || brands.includes(p.brand)) && (!inStock || p.stock > 0));
  if (price) { const [a, b] = price.split('-').map(Number); list = list.filter((p) => p.price >= a && p.price <= b); }
  if (SORTS[sort]) list = [...list].sort(SORTS[sort]);
  const brandCount = count(base, 'brand');
  const brandList = Object.keys(brandCount).filter(Boolean).sort((a, b) => brandCount[b] - brandCount[a]).slice(0, 14);
  const catCount = count(base, 'category');
  const togBrand = (b) => setBrands(brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]);
  const subEntries = Object.entries(subs).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <>
      <div className="crumb"><Link to="/">Home</Link> › {mode === 'category' ? <Link to={'/c/' + cat}>{CATS[cat] || cat}</Link> : title}{sub && <> › {sub}</>}</div>
      <div className="lay">
        <aside className="side">
          {mode === 'category' ? (
            <>
              <h4 style={{ marginTop: 0 }}>Department</h4>
              <Link to={'/c/' + cat} style={{ display: 'block', padding: '2px 0', fontWeight: sub ? 400 : 800 }}>All {CATS[cat]}</Link>
              {subEntries.map(([s, n]) => <Link key={s} to={'/c/' + cat + '?sub=' + encodeURIComponent(s)} style={{ display: 'block', padding: '2px 0 2px 12px', fontWeight: s === sub ? 800 : 400 }}>{s} <span className="mu">({n})</span></Link>)}
            </>
          ) : (
            <>
              <h4 style={{ marginTop: 0 }}>Category</h4>
              {Object.keys(catCount).map((k) => <Link key={k} to={'/c/' + k} style={{ display: 'block', padding: '2px 0' }}>{CATS[k]} <span className="mu">({catCount[k]})</span></Link>)}
            </>
          )}
          <h4>Customer reviews</h4>
          {[0, 4, 3].map((r) => <label key={r}><input type="radio" name="rt" checked={rate === r} onChange={() => setRate(r)} />{r ? r + '★ & up' : 'All'}</label>)}
          <h4>Price</h4>
          {PRICE_RANGES.map(([v, l]) => <label key={v}><input type="radio" name="pr" checked={price === v} onChange={() => setPrice(v)} />{l}</label>)}
          <h4>Brand</h4>
          {brandList.map((b) => <label key={b}><input type="checkbox" checked={brands.includes(b)} onChange={() => togBrand(b)} />{b} <span className="mu">({brandCount[b]})</span></label>)}
          <h4>Availability</h4>
          <label><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />In stock only</label>
        </aside>
        <div>
          {mode === 'category' && subEntries.length > 1 && (
            <div className="sub-chips">
              <Link className={'chip' + (sub ? '' : ' on')} to={'/c/' + cat}>All</Link>
              {subEntries.map(([s]) => <Link key={s} className={'chip' + (s === sub ? ' on' : '')} to={'/c/' + cat + '?sub=' + encodeURIComponent(s)}>{s}</Link>)}
            </div>
          )}
          <div className="bar">
            <b>{list.length} results · {title}</b>
            <select className="in" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
              <option value="rating">Avg. customer review</option><option value="off">Biggest discount</option>
            </select>
          </div>
          {list.length ? <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <div className="box">No products match these filters.</div>}
        </div>
      </div>
    </>
  );
}
