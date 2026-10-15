const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { auth, adminOnly } = require('../middleware/auth');
const { wrap } = require('../utils/helpers');

// Admin image upload: the browser sends the picture as a base64 data URL, we save it in backend/uploads
module.exports = (app, express) => {
  const dir = path.join(__dirname, '..', 'uploads');
  app.use('/uploads', express.static(dir));
  app.post('/api/admin/upload', express.json({ limit: '6mb' }), auth, adminOnly, wrap(async (req, res) => {
    const m = /^data:image\/(png|jpeg|webp|gif);base64,(.+)$/.exec(req.body.data || '');
    if (!m) return res.status(400).json({ error: 'Upload a PNG, JPG, WEBP or GIF image' });
    fs.mkdirSync(dir, { recursive: true });
    const name = crypto.randomBytes(8).toString('hex') + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
    fs.writeFileSync(path.join(dir, name), Buffer.from(m[2], 'base64'));
    res.json({ url: '/uploads/' + name });
  }));
};
