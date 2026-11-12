export const ONLINE_MEETING_NOTICE = 'Link pertemuan akan tersedia dan dikirim kepada peserta terkonfirmasi pada H-1 sebelum kegiatan.';

export function getMeetingReleaseTime(isoDate) {
  if (typeof isoDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const date = Date.parse(`${isoDate}T00:00:00Z`);
  if (!Number.isFinite(date) || new Date(date).toISOString().slice(0, 10) !== isoDate) return null;
  // H-1 begins at 00:00 WIB on the calendar day before the workshop.
  return date - 24 * 60 * 60 * 1000 - 7 * 60 * 60 * 1000;
}

function getMeetingUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function getMeetingAccess(workshop, registration, now = Date.now()) {
  if (workshop.mode !== 'online') return null;
  const availableAt = getMeetingReleaseTime(workshop.isoDate);
  const result = { availableAt, url: null };
  if (workshop.completed || registration?.status === 'completed') return { ...result, status: 'completed' };
  if (registration?.status === 'waiting') return { ...result, status: 'waiting-list' };
  if (registration?.status !== 'registered') return { ...result, status: 'registration-required' };
  if (availableAt === null || !Number.isFinite(now)) return { ...result, status: 'pending' };
  if (now < availableAt) return { ...result, status: 'scheduled' };
  const url = getMeetingUrl(workshop.meetingUrl);
  return url ? { ...result, status: 'available', url } : { ...result, status: 'pending' };
}
