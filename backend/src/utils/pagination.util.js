/**
 * Pagination di server.
 * Bila query memuat `page`, endpoint mengembalikan { items, meta }; tanpa `page`
 * tetap mengembalikan array penuh (kompatibel dengan pemanggil lama).
 */
function parsePage(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  if (query.page === undefined) return null;
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, offset: (page - 1) * limit };
}

const pageResult = (items, total, { page, limit }) => ({
  items,
  meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
});

module.exports = { parsePage, pageResult };
