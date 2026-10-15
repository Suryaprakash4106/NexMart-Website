export const CATS = {
  Electronics: 'Electronics', Fashion: 'Fashion', Home: 'Home & Kitchen', Furniture: 'Furniture',
  Books: 'Books', Sports: 'Sports', Beauty: 'Beauty', Grocery: 'Grocery', Health: 'Health',
  Automotive: 'Automotive', Toys: 'Toys & Games',
};
export const PRICE_RANGES = [
  ['', 'Any price'], ['0-500', 'Under ₹500'], ['500-2000', '₹500 – ₹2,000'],
  ['2000-10000', '₹2,000 – ₹10,000'], ['10000-50000', '₹10,000 – ₹50,000'], ['50000-9999999', 'Over ₹50,000'],
];
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const off = (p) => (p.originalPrice > 0 ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
export const stars = (r) => { const n = Math.max(0, Math.min(5, Math.round(+r || 0))); return '★'.repeat(n) + '☆'.repeat(5 - n); };
export const deliveryBy = (days = 3) => new Date(Date.now() + days * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

// shown when a product photo link is broken, so the card layout never collapses
export const NO_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#f1f4f9"/><g fill="none" stroke="#9aa8bd" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><rect x="120" y="140" width="160" height="120" rx="12"/><circle cx="170" cy="185" r="14"/><path d="M130 250l50-45 40 32 25-20 25 33"/></g></svg>');
export const imgFallback = (e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_IMG; };
