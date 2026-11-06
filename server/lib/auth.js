const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./store');

const SECRET = process.env.JWT_SECRET || 'brivastore-dev-secret';

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, SECRET, { expiresIn: '14d' });
}

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

function hash(password) {
  return bcrypt.hashSync(password, 8);
}
function verify(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
}

/** Attaches req.user when a valid bearer token is present (never blocks). */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET);
      req.user = db.users.byId(payload.sub) || null;
    } catch (_e) {
      req.user = null;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}

module.exports = { sign, hash, verify, publicUser, optionalAuth, requireAuth, requireAdmin };
