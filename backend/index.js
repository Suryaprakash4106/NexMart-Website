require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN = '*' } = process.env;
if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET in backend/.env');
  process.exit(1);
}

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN.split(',') }));
require('./routes/uploadRoutes')(app, express); // has its own bigger body limit, so it must come first
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));

['auth', 'user', 'product', 'review', 'cart', 'order', 'payment', 'admin'].forEach((r) => require(`./routes/${r}Routes`)(app));
app.get('/api/health', (req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));

// Serve the built React app (run "npm run build" inside /frontend first)
const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

mongoose.connect(MONGODB_URI).then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`NexMart running on http://localhost:${port}`));
}).catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
