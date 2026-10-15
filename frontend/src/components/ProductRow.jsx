import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import Reveal from './Reveal';

export default function ProductRow({ title, items, to }) {
  if (!items.length) return null;
  return (
    <Reveal as="section" className="sec">
      <div className="hd"><h2>{title}</h2>{to && <Link to={to}>See all</Link>}</div>
      <div className="row">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </Reveal>
  );
}
