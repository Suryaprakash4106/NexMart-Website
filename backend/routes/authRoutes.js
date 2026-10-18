const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Otp } = require('../models');
const { sign, publicUser, wrap } = require('../utils/helpers');
const { ADMIN_EMAIL } = process.env;

const OTP_TTL_MS = 10 * 60 * 1000;   // OTP valid for 10 minutes
const RESEND_GAP_MS = 60 * 1000;     // 60 seconds between OTP emails
const MAX_ATTEMPTS = 5;              // wrong tries allowed per OTP

const norm = (e) => String(e || '').trim().toLowerCase();
const makeCode = () => String(crypto.randomInt(100000, 1000000));
const hashCode = (email, code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(email + ':' + code).digest('hex');
const safeEqual = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };

// Sends the OTP through EmailJS (HTTPS API, works on Railway Hobby)
async function sendOtpMail(email, name, code) {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } = process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
    if (process.env.NODE_ENV === 'production') throw new Error('MAIL_NOT_CONFIGURED');
    console.log(`[DEV] OTP for ${email}: ${code}`); // local testing: OTP shows in this terminal
    return;
  }
  const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      // both naming styles are sent, so the template works with {{to_email}}/{{to_name}} or {{email}}/{{name}}
      template_params: { to_email: email, email, to_name: name, name, otp: code },
    }),
  });
  if (!resp.ok) { console.error('EmailJS error', resp.status, await resp.text()); throw new Error('MAIL_FAILED'); }
}

const mailFail = (res, e) =>
  e.message === 'MAIL_NOT_CONFIGURED'
    ? res.status(503).json({ error: 'Email service is not set up yet' })
    : res.status(502).json({ error: 'Could not send the OTP email. Please try again' });

module.exports = (app) => {
  // Step 1: validate details, email a 6-digit OTP (no account yet)
  app.post('/api/auth/register/send-otp', wrap(async (req, res) => {
    const { name, password } = req.body;
    const email = norm(req.body.email);
    const phone = String(req.body.phone || '').replace(/\D/g, '').slice(-10);
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
    if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be 8+ characters' });
    if (phone && phone.length !== 10) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });

    const old = await Otp.findOne({ email });
    if (old) {
      const wait = RESEND_GAP_MS - (Date.now() - old.lastSentAt.getTime());
      if (wait > 0) return res.status(429).json({ error: `Please wait ${Math.ceil(wait / 1000)}s before requesting another OTP` });
    }

    const code = makeCode();
    await Otp.findOneAndUpdate(
      { email },
      {
        email, name: String(name).trim(), phone,
        passwordHash: await bcrypt.hash(password, 12),
        codeHash: hashCode(email, code),
        attempts: 0, lastSentAt: new Date(), expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    try { await sendOtpMail(email, String(name).trim(), code); }
    catch (e) { await Otp.deleteOne({ email }); return mailFail(res, e); }
    res.json({ ok: true, email, resendIn: RESEND_GAP_MS / 1000 });
  }));

  // Step 2 (optional): send a fresh OTP for the same pending signup
  app.post('/api/auth/register/resend-otp', wrap(async (req, res) => {
    const email = norm(req.body.email);
    const rec = await Otp.findOne({ email });
    if (!rec) return res.status(400).json({ error: 'Session expired. Please register again' });
    const wait = RESEND_GAP_MS - (Date.now() - rec.lastSentAt.getTime());
    if (wait > 0) return res.status(429).json({ error: `Please wait ${Math.ceil(wait / 1000)}s before requesting another OTP` });

    const code = makeCode();
    rec.codeHash = hashCode(email, code);
    rec.attempts = 0;
    rec.lastSentAt = new Date();
    rec.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await rec.save();
    try { await sendOtpMail(email, rec.name, code); } catch (e) { return mailFail(res, e); }
    res.json({ ok: true, resendIn: RESEND_GAP_MS / 1000 });
  }));

  // Step 3: check the OTP, then create the account and sign in
  app.post('/api/auth/register/verify-otp', wrap(async (req, res) => {
    const email = norm(req.body.email);
    const code = String(req.body.otp || '').trim();
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Enter the 6-digit OTP' });

    // count the attempt first so parallel guesses cannot beat the limit
    const rec = await Otp.findOneAndUpdate({ email }, { $inc: { attempts: 1 } }, { new: true });
    if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ error: 'OTP expired. Please request a new one' });
    if (rec.attempts > MAX_ATTEMPTS) {
      await Otp.deleteOne({ email });
      return res.status(429).json({ error: 'Too many wrong attempts. Please register again' });
    }
    if (!safeEqual(rec.codeHash, hashCode(email, code))) {
      const left = MAX_ATTEMPTS - rec.attempts;
      return res.status(400).json({ error: left > 0 ? `Wrong OTP. ${left} attempt${left > 1 ? 's' : ''} left` : 'Wrong OTP. Please request a new one' });
    }
    if (await User.findOne({ email })) { await Otp.deleteOne({ email }); return res.status(409).json({ error: 'Email already registered' }); }

    const role = ADMIN_EMAIL && email === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    const user = await User.create({ name: rec.name, email, phone: rec.phone, role, password: rec.passwordHash });
    await Otp.deleteOne({ email });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  }));

  app.post('/api/auth/login', wrap(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ error: 'Wrong email or password' });
    res.json({ token: sign(user), user: publicUser(user) });
  }));
};