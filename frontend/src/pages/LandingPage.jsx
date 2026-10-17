import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductRow from '../components/ProductRow';
import Reveal from '../components/Reveal';
import { useShop } from '../context/ShopContext';
import { CATS, off, imgFallback } from '../utils/format';

const U = (id, w = 1800) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop`;
const SLIDES = [
  ['photo-1498049794561-7780e7231661', 'Now trending: gadgets', 'Phones, laptops and audio with up to 65% off.', '/c/Electronics', 'Shop electronics'],
  ['photo-1441986300917-64674bd600d8', 'New season fashion', 'Everyday styles from brands you trust, delivered to your door.', '/c/Fashion', 'Shop fashion'],
  ['photo-1556909114-f6e7ad7d3136', 'Make your kitchen smarter', 'Cookers, air fryers and appliances for every home.', '/c/Home', 'Shop home and kitchen'],
];
const WORD = 'NEXMART';
const MARQUEE = ['Free delivery above ₹499', '7-day easy returns', 'Secure payments', 'New arrivals every week', 'Delivered across India'];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// runs fn on mount, scroll and resize (one frame at a time)
function useFrame(fn) {
  useEffect(() => {
    let t = 0;
    const h = () => { if (t) return; t = requestAnimationFrame(() => { t = 0; fn(); }); };
    fn();
    window.addEventListener('scroll', h, { passive: true });
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('scroll', h); window.removeEventListener('resize', h); cancelAnimationFrame(t); };
  }, []); // eslint-disable-line
}

// words light up one by one while you scroll
function ScrollWords({ text }) {
  const ref = useRef(null);
  const words = text.split(' ');
  useFrame(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.28));
    [...el.children].forEach((w, i) => { w.style.opacity = (0.16 + clamp(p * words.length * 1.15 - i, 0, 1) * 0.84).toFixed(2); });
  });
  return <p className="sw" ref={ref}>{words.map((w, i) => <span key={i}>{w} </span>)}</p>;
}

// sticky section: vertical scroll moves the cards sideways
function HScroll({ children, head }) {
  const sec = useRef(null), tr = useRef(null), bar = useRef(null);
  useFrame(() => {
    const s = sec.current, t = tr.current; if (!s || !t) return;
    if (window.innerWidth <= 800) { s.style.height = 'auto'; t.style.transform = 'none'; return; }
    const max = Math.max(0, t.scrollWidth - window.innerWidth);
    s.style.height = max + window.innerHeight + 'px';
    const p = clamp(-s.getBoundingClientRect().top / Math.max(1, max));
    t.style.transform = `translate3d(${-p * max}px,0,0)`;
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
  });
  return (
    <section className="hs" ref={sec}>
      <div className="hs-in">
        <div className="w hs-h">{head}</div>
        <div className="hs-t" ref={tr}>{children}</div>
        <div className="w"><div className="hs-bar"><i ref={bar} /></div></div>
      </div>
    </section>
  );
}

function CountUp({ to, suffix = '' }) {
  const ref = useRef(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => { const k = clamp((t - t0) / 1500); setN(Math.round((1 - Math.pow(1 - k, 3)) * to)); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span className="cnt" ref={ref}>{n.toLocaleString('en-IN')}{suffix}</span>;
}

// full-width photo that drifts slower than the page
function Banner({ img, title, text, to, cta, side }) {
  const box = useRef(null), inner = useRef(null);
  useFrame(() => {
    const b = box.current, i = inner.current; if (!b || !i) return;
    const r = b.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    i.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) / vh) * -14}%,0) scale(1.2)`;
  });
  return (
    <section className={'pb ' + (side || '')} ref={box}>
      <div className="pbi" ref={inner} style={{ backgroundImage: `url(${U(img)})` }} />
      <div className="pbo" />
      <Reveal className="w pbt"><div><h2>{title}</h2><p>{text}</p><Link className="lbtn" to={to}>{cta}</Link></div></Reveal>
    </section>
  );
}

export default function LandingPage() {
  const { products } = useShop();
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const hero = useRef(null);
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500); return () => clearInterval(t); }, []);
  useFrame(() => { if (hero.current) hero.current.style.setProperty('--hp', clamp(window.scrollY / window.innerHeight).toFixed(3)); });

  const used = new Set();
  const pick = (list, n) => {
    const out = [];
    for (const p of list) { if (out.length >= n) break; if (!used.has(p.id)) { used.add(p.id); out.push(p); } }
    return out;
  };
  const deals = pick(products.filter((p) => p.deal).sort((a, b) => off(b) - off(a)), 12);
  const fresh = pick([...products].sort((a, b) => b.id - a.id), 12);
  const faves = pick(products.filter((p) => p.reviews > 0).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews), 12);
  const pic = (c) => products.find((p) => p.category === c);
  const total = (c) => products.filter((p) => p.category === c).length;
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
  const s = SLIDES[i];

  return (
    <>
      <section className="lh" ref={hero}>
        {SLIDES.map((x, k) => (
          <div key={k} className={'ls' + (k === i ? ' on' : '')}>
            <div className="lsi" style={{ backgroundImage: `url(${U(x[0])})` }} />
          </div>
        ))}
        <div className="lov" />
        <div className="lcn">
          <div className="lpre" key={'a' + i}>{s[1]}</div>
          <h1 className="lwm" aria-label="NexMart">{WORD.split('').map((ch, k) => <span key={k} style={{ animationDelay: 250 + k * 80 + 'ms' }}>{ch}</span>)}</h1>
          <p className="lpp" key={'b' + i}>{s[2]}</p>
          <button className="lbtn" key={'c' + i} onClick={() => nav(s[3])}>{s[4]}</button>
        </div>
        <div className="lsc">Scroll</div>
        <div className="ldots">{SLIDES.map((_, k) => <i key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      </section>

      <div className="mq" aria-hidden="true">
        <div className="mq-t">{[0, 1].map((n) => <div key={n} className="mq-h">{MARQUEE.map((m) => <span key={m}>{m}</span>)}{MARQUEE.map((m) => <span key={m + 'b'}>{m}</span>)}</div>)}</div>
      </div>

      <div className="w intro">
        <ScrollWords text="Electronics, fashion, home, books, beauty and more. Everything you need, picked with care and delivered to your door across India." />
      </div>

      <HScroll head={<><h2>Shop by category</h2><Link to="/shop">View all products</Link></>}>
        {Object.keys(CATS).map((c) => (
          <Link key={c} to={'/c/' + c} className="hs-c">
            <div className="hs-i">{pic(c) && <img src={pic(c).image} alt="" loading="lazy" onError={imgFallback} />}</div>
            <div className="hs-n"><b>{CATS[c]}</b><span>{total(c)} products</span></div>
          </Link>
        ))}
        <Link to="/shop" className="hs-c all"><div className="hs-i"><b>Shop<br />everything</b></div><div className="hs-n"><b>All products</b><span>{products.length} products</span></div></Link>
      </HScroll>

      <Reveal className="w stats">
  <div><b><CountUp to={Math.floor(products.length / 100) * 100} suffix="+" /></b><span>Products</span></div>
  <div><b><CountUp to={Object.keys(CATS).length} /></b><span>Categories</span></div>
  <div><b><CountUp to={Math.floor(brands.length / 50) * 50} suffix="+" /></b><span>Brands</span></div>
  <div><b><CountUp to={7} /></b><span>Day easy returns</span></div>
</Reveal>

      <div className="w">
        <ProductRow title="Hot deals" items={deals} to="/deals" />
      </div>

      <Banner img="photo-1523275335684-37898b6baf30" title="Style that lasts" text="Watches, eyewear, bags and everyday fashion for every budget." to="/c/Fashion" cta="Shop fashion" />

      <div className="w">
        <ProductRow title="New arrivals" items={fresh} to="/shop" />
      </div>

      <Banner img="photo-1505740420928-5e560c06d30e" title="Sound, screens, smart tech" text="Headphones, speakers, phones and more from brands you know." to="/c/Electronics" cta="Shop electronics" side="r" />

      <div className="w">
        <ProductRow title="Customer favourites" items={faves} to="/shop" />
      </div>

      <div className="mq rev" aria-hidden="true">
        <div className="mq-t">{[0, 1].map((n) => <div key={n} className="mq-h">{brands.slice(0, 22).map((b) => <span key={b + n}>{b}</span>)}</div>)}</div>
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
