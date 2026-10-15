import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { stars } from '../utils/format';

export default function Reviews({ product }) {
  const { user, setAuthOpen } = useAuth();
  const { toast, loadProducts } = useShop();
  const [d, setD] = useState(null);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const load = useCallback(() => api('/products/' + product.id + '/reviews').then(setD).catch(() => setD({ reviews: [], hist: {}, count: 0, avg: 0 })), [product.id]);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    try {
      await api('/products/' + product.id + '/reviews', 'POST', { rating, title, comment });
      setRating(0); setTitle(''); setComment('');
      toast('Thanks for your review');
      load(); loadProducts();
    } catch (e) { toast(e.message); }
  };
  if (!d) return null;
  const mine = user && d.reviews.find((r) => r.user === user.id);

  return (
    <section className="rv">
      <div>
        <h2>Customer reviews</h2>
        {d.count > 0 ? (
          <>
            <div className="st" style={{ fontSize: 18, margin: '8px 0' }}><b>{stars(d.avg)}</b> {d.avg} out of 5</div>
            <div className="mu">{d.count} global ratings</div>
            <div className="hist">{[5, 4, 3, 2, 1].map((n) => (
              <div key={n}><span style={{ width: 40 }}>{n} star</span><i><b style={{ width: (d.hist[n] / d.count) * 100 + '%' }} /></i><span style={{ width: 36 }}>{Math.round((d.hist[n] / d.count) * 100)}%</span></div>
            ))}</div>
          </>
        ) : <p className="mu">No reviews yet. Be the first to review this product.</p>}
        <div className="box" style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 8 }}>{mine ? 'Update your review' : 'Review this product'}</h4>
          {user ? (
            <>
              <div className="starpick">{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={n + ' star'} onClick={() => setRating(n)}>{n <= rating ? '★' : '☆'}</button>)}</div>
              <input className="in" placeholder="Headline (optional)" value={title} onChange={(e) => setTitle(e.target.value)} style={{ margin: '8px 0' }} />
              <textarea className="in" rows={3} placeholder="What did you like or dislike?" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="btn" style={{ marginTop: 10 }} disabled={!rating} onClick={submit}>Submit review</button>
            </>
          ) : <button className="btn ln f" onClick={() => setAuthOpen(true)}>Sign in to write a review</button>}
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: 6 }}>Top reviews</h3>
        {d.reviews.map((r) => (
          <div className="rvi" key={r._id}>
            <b>{r.userName || 'Customer'}</b>{r.verified && <span className="vf">Verified purchase</span>}{r.sample && <span className="sm">Sample review</span>}
            <div className="st"><b>{stars(r.rating)}</b> {r.title && <b style={{ color: 'var(--ink)' }}>{r.title}</b>}</div>
            <div className="mu" style={{ fontSize: 12 }}>Reviewed on {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <p style={{ marginTop: 6 }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
