import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SLIDES = [
  ['photo-1498049794561-7780e7231661', 'Latest gadgets, lowest prices', 'Phones, laptops and audio with up to 65% off.', '/c/Electronics'],
  ['photo-1441986300917-64674bd600d8', 'New season fashion', 'Everyday styles from brands you trust.', '/c/Fashion'],
  ['photo-1556909114-f6e7ad7d3136', 'Make your kitchen smarter', 'Cookers, air fryers and appliances for every home.', '/c/Home'],
];

export default function Hero() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5000); return () => clearInterval(t); }, []);
  return (
    <div className="hero2">
      <div className="hero">
        {SLIDES.map((s, k) => (
          <div key={k} className={'sl' + (k === i ? ' on' : '')} style={{ backgroundImage: `url(https://images.unsplash.com/${s[0]}?w=1400&auto=format&fit=crop)` }}>
            <div><h2>{s[1]}</h2><p>{s[2]}</p><button className="btn" onClick={() => nav(s[3])}>Shop now</button></div>
          </div>
        ))}
        <div className="dots">{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      </div>
      <aside className="promos">
        <Link to="/deals" className="pm pm1"><small>Up to 65% off</small><b>Hot deals</b><span>See all offers</span></Link>
        <div className="pm pm2"><small>On orders above ₹499</small><b>Free delivery</b><span>Across India</span></div>
      </aside>
    </div>
  );
}
