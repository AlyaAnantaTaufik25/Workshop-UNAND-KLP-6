const { AsyncLocalStorage } = require('async_hooks');

/**
 * Konteks per-request (IP, user-agent, user) yang bisa dibaca dari service mana pun
 * tanpa meneruskan `req` — dipakai audit log.
 */
const storage = new AsyncLocalStorage();

function requestContext(req, res, next) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  storage.run({ ip: forwarded || req.socket?.remoteAddress || null, userAgent: String(req.headers['user-agent'] || '').slice(0, 300), user: null }, next);
}

/** Dipanggil middleware auth setelah user diketahui */
function setContextUser(user) {
  const ctx = storage.getStore();
  if (ctx) ctx.user = user;
}

const getContext = () => storage.getStore() || {};

module.exports = { requestContext, setContextUser, getContext };
