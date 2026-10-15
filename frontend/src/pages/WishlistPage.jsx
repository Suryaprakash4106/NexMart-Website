import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';

export default function WishlistPage() {
  const { wish, byId } = useShop();
  const items = wish.map(byId).filter(Boolean);
  return (
    <>
      <h2 style={{ margin: '20px 0' }}>My wishlist</h2>
      {items.length ? <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div> : <div className="box">Nothing saved yet. Tap the heart on any product.</div>}
    </>
  );
}
