import { useEffect, useRef, useState } from 'react';

// 360 degree viewer. Drag (or swipe) to rotate; it also turns by itself until you touch it.
// - If the product has `spin` (a list of 8+ photos taken around the product) it scrubs through those frames.
// - Otherwise it shows the product on a 3D turntable card using its own photos (front and back).
export default function Spin360({ product, images, onClose }) {
  const frames = product.spin && product.spin.length >= 8 ? product.spin : null;
  const [angle, setAngle] = useState(0);
  const drag = useRef(null);
  const auto = useRef(true);

  useEffect(() => {
    const t = setInterval(() => { if (auto.current) setAngle((a) => (a + 0.6) % 360); }, 16);
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => { clearInterval(t); window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const down = (e) => { drag.current = e.clientX; auto.current = false; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current; drag.current = e.clientX;
    setAngle((a) => (((a + dx * 0.7) % 360) + 360) % 360);
  };
  const up = () => { drag.current = null; setTimeout(() => { if (drag.current === null) auto.current = true; }, 2500); };

  const front = images[0];
  const back = images[1] || images[0];
  const idx = frames ? Math.floor((angle / 360) * frames.length) % frames.length : 0;

  return (
    <div className="ov on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="spin">
        <div className="spin-h"><b>{product.name}</b><button className="dw-x" onClick={onClose}>Close</button></div>
        <div className="spin-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {frames ? (
            <img className="spin-f" src={frames[idx]} alt={product.name} draggable={false} />
          ) : (
            <div className="spin-3d">
              <div className="spin-card" style={{ transform: `rotateY(${angle}deg)` }}>
                <img className="sf" src={front} alt={product.name} draggable={false} />
                <img className="sb" src={back} alt="" draggable={false} />
              </div>
              <div className="spin-sh" style={{ transform: `scaleX(${0.55 + Math.abs(Math.cos((angle * Math.PI) / 180)) * 0.45})` }} />
            </div>
          )}
        </div>
        <div className="spin-n">Drag left or right to rotate</div>
      </div>
    </div>
  );
}
