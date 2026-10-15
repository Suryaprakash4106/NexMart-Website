// One place for every call to the backend
export async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('nm_token');
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) window.dispatchEvent(new Event('nm-logout'));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export function loadRazorpay() {
  return new Promise((ok, no) => {
    if (window.Razorpay) return ok();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = ok;
    s.onerror = () => no(new Error('Could not load the payment window'));
    document.head.appendChild(s);
  });
}
