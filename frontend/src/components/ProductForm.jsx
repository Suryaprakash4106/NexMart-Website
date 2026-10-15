import { useState } from 'react';
import { api } from '../services/api';
import { CATS } from '../utils/format';

export default function ProductForm({ product, onClose, onSaved, toast }) {
  const p = product || { name: '', brand: '', category: 'Electronics', subcategory: '', price: '', originalPrice: '', stock: 10, image: '', images: [], description: '', features: [], deal: false, featured: false };
  const [f, setF] = useState({ ...p, features: (p.features || []).join(', ') });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  // upload a photo from your computer; it is saved in backend/uploads
  const upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast('Image must be under 4 MB');
    const r = new FileReader();
    r.onload = async () => {
      try { const d = await api('/admin/upload', 'POST', { data: r.result }); setF((cur) => ({ ...cur, image: d.url })); toast('Image uploaded'); }
      catch (err) { toast(err.message); }
    };
    r.readAsDataURL(file);
  };

  const save = async () => {
    const rest = (p.images || []).filter((x) => x !== p.image && x !== f.image);
    const body = { ...f, images: [f.image, ...rest].filter(Boolean), features: f.features.split(',').map((x) => x.trim()).filter(Boolean) };
    try {
      await api(product ? '/admin/products/' + product.id : '/admin/products', product ? 'PUT' : 'POST', body);
      toast('Product saved'); onSaved();
    } catch (e) { toast(e.message); }
  };
  return (
    <div className="ov on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="md">
        <h3>{product ? 'Edit' : 'Add'} product</h3>
        <input className="in" placeholder="Name" value={f.name} onChange={set('name')} />
        <div className="two">
          <input className="in" placeholder="Brand" value={f.brand} onChange={set('brand')} />
          <select className="in" value={f.category} onChange={set('category')}>{Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <input className="in" placeholder="Sub-category (e.g. Mobiles)" value={f.subcategory || ''} onChange={set('subcategory')} />
        <div className="two">
          <input className="in" type="number" placeholder="Price" value={f.price} onChange={set('price')} />
          <input className="in" type="number" placeholder="M.R.P. (original price)" value={f.originalPrice} onChange={set('originalPrice')} />
        </div>
        <input className="in" type="number" placeholder="Stock" value={f.stock} onChange={set('stock')} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {f.image && <img src={f.image} alt="" style={{ width: 64, height: 64, objectFit: 'contain', background: '#fff', border: '1px solid var(--line)', borderRadius: 8 }} />}
          <div style={{ flex: 1 }}>
            <input className="in" placeholder="Image URL, or upload below" value={f.image} onChange={set('image')} />
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} style={{ marginTop: 6 }} />
          </div>
        </div>
        <textarea className="in" placeholder="Description" value={f.description} onChange={set('description')} />
        <input className="in" placeholder="Highlights, comma separated" value={f.features} onChange={set('features')} />
        <label><input type="checkbox" checked={!!f.deal} onChange={set('deal')} /> Show in deals</label>
        <label><input type="checkbox" checked={!!f.featured} onChange={set('featured')} /> Featured</label>
        <button className="btn" onClick={save}>Save product</button>
      </div>
    </div>
  );
}
