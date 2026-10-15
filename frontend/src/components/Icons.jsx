const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const I = (d, size = 22, sw) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={sw || 2}>{d}</svg>
);
export const Sun = () => I(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>);
export const Moon = () => I(<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />);
export const Heart = ({ size = 17 }) => I(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8z" />, size);
export const User = () => I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>);
export const Box = ({ size = 22, sw }) => I(<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8" />, size, sw);
export const Cart = () => I(<><path d="M3 4h2l2.4 11h10l2-8H6.5" /><circle cx="9" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" /></>, 24);
export const Pin = ({ size = 18, sw }) => I(<><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>, size, sw);
export const Search = () => I(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>, 20, 2.4);
export const Lock = () => I(<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>, 40, 1.6);
export const Card = () => I(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>, 40, 1.6);
export const Dash = () => I(<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />, 40, 1.6);
