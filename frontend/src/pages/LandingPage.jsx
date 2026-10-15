import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductRow from '../components/ProductRow';
import Reveal from '../components/Reveal';
import { useShop } from '../context/ShopContext';
import { CATS, off, imgFallback } from '../utils/format';

const SLIDES = [
  ['photo-1498049794561-7780e7231661', 'Now trending: gadgets', 'Phones, laptops and audio with up to 65% off.', '/c/Electronics', 'Shop electronics'],
  ['photo-1441986300917-64674bd600d8', 'New season fashion', 'Everyday styles from brands you trust, delivered to your door.', '/c/Fashion', 'Shop fashion'],
  ['photo-1556909114-f6e7ad7d3136', 'Make your kitchen smarter', 'Cookers, air fryers and appliances for every home.', '/c/Home', 'Shop home and kitchen'],
];
const WORD = 'NEXMART';
const MARQUEE = ['Free delivery above ₹499', '7-day easy returns', 'Secure payments', 'New arrivals every week', 'Delivered across India'];

export default function LandingPage() {
  const { products } = useShop();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500); return () => clearInterval(t); }, []);

  const used = new Set();
  const pick = (list, n) => {
    const out = [];
    for (const p of list) { if (out.length >= n) break; if (!used.has(p.id)) { used.add(p.id); out.push(p); } }
    return out;
  };
  const deals = pick(products.filter((p) => p.deal).sort((a, b) => off(b) - off(a)), 12);
  const faves = pick(products.filter((p) => p.reviews > 0).sort((a, b) => b.rating - a.rating), 12);
  const pic = (c) => products.find((p) => p.category === c);
  const total = (c) => products.filter((p) => p.category === c).length;
  const s = SLIDES[i];

  return (
    <>
      <section className="lh">
        {SLIDES.map((x, k) => (
          <div key={k} className={'ls' + (k === i ? ' on' : '')}>
            <div className="lsi" style={{ backgroundImage: `url(https://images.unsplash.com/${x[0]}?w=1800&auto=format&fit=crop)` }} />
          </div>
        ))}
        <div className="lov" />
        <div className="lcn">
          <div className="lpre" key={'a' + i}>{s[1]}</div>
          <h1 className="lwm" aria-label="NexMart">{WORD.split('').map((ch, k) => <span key={k} style={{ animationDelay: 250 + k * 80 + 'ms' }}>{ch}</span>)}</h1>
          <p className="lp" key={'b' + i}>{s[2]}</p>
          <button className="lbtn" key={'c' + i} onClick={() => nav(s[3])}>{s[4]}</button>
        </div>
        <div className="lsc">Scroll</div>
        <div className="ldots">{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      </section>

      <div className="mq" aria-hidden="true">
        <div className="mq-t">{[0, 1].map((n) => <div key={n} className="mq-h">{MARQUEE.map((m) => <span key={m}>{m}</span>)}{MARQUEE.map((m) => <span key={m + 'b'}>{m}</span>)}</div>)}</div>
      </div>

      <Reveal className="w ls-sec">
        <div className="ls-h"><h2>Shop by category</h2><Link to="/shop">View all products</Link></div>
        <div className="cgrid">
          {Object.keys(CATS).map((c, k) => (
            <Reveal key={c} className="ct" delay={(k % 4) * 90}>
              <Link to={'/c/' + c}>
                <div className="ct-i">{pic(c) && <img src={pic(c).image} alt="" loading="lazy" onError={imgFallback} />}</div>
                <div className="ct-c">{CATS[c]}<span>{total(c)}</span></div>
              </Link>
            </Reveal>
          ))}
          <Reveal className="ct all" delay={270}>
            <Link to="/shop">
              <div className="ct-i"><b>Shop<br />everything</b></div>
              <div className="ct-c">All products<span>{products.length}</span></div>
            </Link>
          </Reveal>
        </div>
      </Reveal>

      <div className="w">
        <ProductRow title="Hot deals" items={deals} to="/deals" />
        <ProductRow title="Customer favourites" items={faves} to="/shop" />
      </div>

      <Reveal className="w pro">
        <div><h3>Free delivery</h3><p>On every order above ₹499, and same-day in Chennai on eligible items.</p></div>
        <div><h3>Easy returns</h3><p>Changed your mind? Eligible products can be returned within 7 days.</p></div>
        <div><h3>Secure payments</h3><p>Pay online or on delivery. Your details stay protected at checkout.</p></div>
      </Reveal>

      <Reveal className="cta">
        <h2>Everything you need.<br />One cart.</h2>
        <button className="lbtn" onClick={() => nav('/shop')}>Start shopping</button>
      </Reveal>
    </>
  );
}
