import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductRow from '../components/ProductRow';
import { useShop } from '../context/ShopContext';
import { CATS, off, imgFallback } from '../utils/format';

export default function HomePage() {
  const { products } = useShop();
  const nav = useNavigate();

  // every product is shown in only ONE row on the home page
  const used = new Set();
  const pick = (list, n) => {
    const out = [];
    for (const p of list) { if (out.length >= n) break; if (!used.has(p.id)) { used.add(p.id); out.push(p); } }
    return out;
  };
  const byRating = (a, b) => b.rating - a.rating;
  const rows = [
    ['Hot deals', pick(products.filter((p) => p.deal).sort((a, b) => off(b) - off(a)), 12), '/deals'],
    ['Customer favourites', pick(products.filter((p) => p.reviews > 0).sort(byRating), 12)],
    ...['Electronics', 'Fashion', 'Beauty', 'Home', 'Grocery'].map((c) => [CATS[c] + ' picks', pick(products.filter((p) => p.category === c).sort(byRating), 10), '/c/' + c]),
    ['Staff picks', pick(products.filter((p) => p.featured), 12)],
  ];

  // one round picture per category
  const pic = (c) => products.find((p) => p.category === c);

  return (
    <>
      <div className="bubbles">
        {Object.keys(CATS).map((c) => (
          <button key={c} className="bub" onClick={() => nav('/c/' + c)}>
            <span>{pic(c) && <img src={pic(c).image} alt="" loading="lazy" onError={imgFallback} />}</span>
            {CATS[c]}
          </button>
        ))}
      </div>
      <Hero />
      {rows.map(([t, items, to]) => <ProductRow key={t} title={t} items={items} to={to} />)}
    </>
  );
}
