import { Link } from 'react-router-dom';
import { CATS } from '../utils/format';

export default function Footer() {
  return (
    <>
      <a className="top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</a>
      <footer><div className="w">
        <div className="cols">
          <div><h5>NexMart</h5><p className="fb">Everyday shopping, delivered across India.</p><a>About us</a><a>Careers</a><a>Press</a><a>Blog</a></div>
          <div><h5>Shop</h5><Link to="/shop">All products</Link>{Object.entries(CATS).slice(0, 5).map(([k, v]) => <Link key={k} to={'/c/' + k}>{v}</Link>)}</div>
          <div><h5>My NexMart</h5><Link to="/account">My account</Link><Link to="/orders">My orders</Link><Link to="/account/addresses">Addresses</Link><Link to="/wishlist">Wishlist</Link></div>
          <div><h5>Help</h5><a>Shipping and delivery</a><a>Returns and refunds</a><a>Payment help</a><a>Contact us</a></div>
          <div><h5>Policies</h5><a>Privacy policy</a><a>Terms of use</a><a>Cookie policy</a><a>Seller policy</a></div>
        </div>
        <div className="cp">© {new Date().getFullYear()} NexMart. All rights reserved. Designed and developed by Suryaprakash K.</div>
      </div>
      <div className="fw" aria-hidden="true">NEXMART</div>
      </footer>
    </>
  );
}
