import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

const LEN = 6;
const empty = () => Array(LEN).fill('');
const fmt = (s) => `0:${String(s).padStart(2, '0')}`;
const mask = (e) => {
  const [u = '', d = ''] = String(e).trim().split('@');
  return (u.length > 2 ? u[0] + '•••' + u.slice(-1) : u) + '@' + d;
};

export default function AuthModal() {
  const { authOpen, setAuthOpen, authenticate, sendOtp, resendOtp, verifyOtp } = useAuth();
  const { toast } = useShop();
  const [reg, setReg] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [code, setCode] = useState(empty());
  const [left, setLeft] = useState(0);      // resend countdown (seconds)
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState(false);    // shake on wrong OTP
  const [err, setErr] = useState('');
  const boxes = useRef([]);
  const otp = code.join('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const focusBox = (i) => setTimeout(() => boxes.current[i]?.focus(), 60);

  // resend countdown
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  // reset the OTP step whenever the popup closes
  useEffect(() => {
    if (!authOpen) { setStep('form'); setCode(empty()); setLeft(0); setErr(''); setF((x) => ({ ...x, password: '' })); }
  }, [authOpen]);

  // focus the first box when the OTP step opens
  useEffect(() => { if (step === 'otp') focusBox(0); }, [step]);

  // verify automatically once all 6 digits are filled
  useEffect(() => { if (step === 'otp' && otp.length === LEN) verify(); }, [otp]); // eslint-disable-line

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!reg) {
        const u = await authenticate('login', f);
        toast('Welcome, ' + u.name.split(' ')[0]);
      } else {
        const d = await sendOtp(f);
        setCode(empty()); setErr(''); setStep('otp'); setLeft(d.resendIn || 60);
        toast('OTP sent to ' + f.email);
      }
    } catch (e) { toast(e.message); }
    setBusy(false);
  };

  const verify = async () => {
    if (busy || otp.length !== LEN) return;
    setBusy(true); setErr('');
    try {
      const u = await verifyOtp(f.email, otp);
      toast('Welcome, ' + u.name.split(' ')[0]);
    } catch (e) {
      setErr(e.message); setBad(true); setCode(empty());
      setTimeout(() => setBad(false), 500);
      focusBox(0);
    }
    setBusy(false);
  };

  const resend = async () => {
    if (busy || left > 0) return;
    setBusy(true); setErr('');
    try {
      const d = await resendOtp(f.email);
      setCode(empty()); setLeft(d.resendIn || 60); toast('New code sent'); focusBox(0);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  // ---- OTP box handling ----
  const onChange = (i) => (e) => {
    const d = e.target.value.replace(/\D/g, '');
    if (!d) { const n = [...code]; n[i] = ''; setCode(n); return; }
    const n = [...code];
    let j = i;
    for (const ch of d) { if (j >= LEN) break; n[j++] = ch; }
    setCode(n);
    boxes.current[Math.min(j, LEN - 1)]?.focus();
  };
  const onKey = (i) => (e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      const n = [...code]; n[i - 1] = ''; setCode(n);
      boxes.current[i - 1]?.focus(); e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) boxes.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < LEN - 1) boxes.current[i + 1]?.focus();
    else if (e.key === 'Enter') verify();
  };
  const onPaste = (e) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!d) return;
    e.preventDefault();
    const n = empty();
    [...d].forEach((c, k) => { n[k] = c; });
    setCode(n);
    boxes.current[Math.min(d.length, LEN - 1)]?.focus();
  };

  return (
    <div className={'ov' + (authOpen ? ' on' : '')} onClick={(e) => e.target === e.currentTarget && setAuthOpen(false)}>
      <div className="md">
        {step === 'otp' ? (
          <div className="otp">
            <div className="otp-ico">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <span className="otp-step">Step 2 of 2</span>
            <h2>Verify your email</h2>
            <p className="otp-sub">Enter the 6-digit code we sent to <b>{mask(f.email)}</b></p>

            <div className={'otp-box' + (bad ? ' shake' : '')} onPaste={onPaste}>
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => { boxes.current[i] = el; }}
                  className={c ? 'filled' : ''}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={'Digit ' + (i + 1)}
                  value={c}
                  disabled={busy}
                  onChange={onChange(i)}
                  onKeyDown={onKey(i)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
            <div className="otp-err">{err}</div>

            <button className="btn f" disabled={busy || otp.length !== LEN} onClick={verify}>{busy ? 'Verifying...' : 'Verify and create account'}</button>
            <div className="otp-row">
              <span className="mu">{left > 0 ? `Resend code in ${fmt(left)}` : "Didn't get the code?"}</span>
              <button className="otp-link" disabled={busy || left > 0} onClick={resend}>Resend</button>
            </div>
            <button className="otp-link otp-back" onClick={() => { setStep('form'); setCode(empty()); setErr(''); }}>← Change email or details</button>
          </div>
        ) : (
          <>
            <h2>{reg ? 'Create account' : 'Sign in'}</h2>
            {reg && <input className="in" placeholder="Full name" value={f.name} onChange={set('name')} />}
            <input className="in" type="email" placeholder="Email" value={f.email} onChange={set('email')} />
            {reg && <input className="in" placeholder="Mobile number" value={f.phone} onChange={set('phone')} />}
            <input className="in" type="password" placeholder="Password (8+ characters)" value={f.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && submit()} />
            <button className="btn f" disabled={busy} onClick={submit}>{busy ? 'Please wait...' : reg ? 'Send OTP' : 'Sign in'}</button>
            <button className="btn ln f" onClick={() => setReg(!reg)}>{reg ? 'I already have an account' : 'Create your NexMart account'}</button>
          </>
        )}
      </div>
    </div>
  );
}