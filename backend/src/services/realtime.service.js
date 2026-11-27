/**
 * Notifikasi real-time via Server-Sent Events (SSE).
 * Klien membuka GET /api/v1/notifications/stream (cookie sesi), server mendorong event
 * `notification` setiap ada notifikasi baru untuk user / peran / instansinya.
 */
const clients = new Set();
const HEARTBEAT_MS = 25000;

function subscribe(req, res) {
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  res.write('retry: 5000\n\n');
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const client = { res, userId: req.user.id, role: req.user.role, partnerId: req.user.partnerId || null };
  clients.add(client);
  const beat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);
  req.on('close', () => { clearInterval(beat); clients.delete(client); });
}

/** Kirim ke klien yang cocok dengan target notifikasi */
function publish(target, payload) {
  const data = `event: notification\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of clients) {
    const match = (target.userId && c.userId === target.userId)
      || (target.roleCode && c.role === target.roleCode && (!target.partnerId || c.partnerId === target.partnerId));
    if (match) {
      try { c.res.write(data); } catch { clients.delete(c); }
    }
  }
}

const count = () => clients.size;

module.exports = { subscribe, publish, count };
