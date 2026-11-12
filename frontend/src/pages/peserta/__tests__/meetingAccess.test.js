import test from 'node:test';
import assert from 'node:assert/strict';
import { getMeetingAccess, getMeetingReleaseTime } from '../meetingAccess.js';

const workshop = { mode: 'online', isoDate: '2026-11-20', meetingUrl: 'https://example.com/meeting' };
const registered = { status: 'registered' };
const releaseTime = Date.parse('2026-11-19T00:00:00+07:00');

test('H-1 starts at midnight WIB, including month and year transitions', () => {
  assert.equal(getMeetingReleaseTime('2026-11-20'), releaseTime);
  assert.equal(getMeetingReleaseTime('2024-03-01'), Date.parse('2024-02-29T00:00:00+07:00'));
  assert.equal(getMeetingReleaseTime('2027-01-01'), Date.parse('2026-12-31T00:00:00+07:00'));
});

test('the meeting URL is hidden until H-1 and available exactly at release time', () => {
  const before = getMeetingAccess(workshop, registered, releaseTime - 1);
  assert.equal(before.status, 'scheduled');
  assert.equal(before.url, null);
  assert.equal(getMeetingAccess(workshop, registered, releaseTime).url, workshop.meetingUrl);
  assert.equal(getMeetingAccess(workshop, registered, releaseTime + 86_400_000).status, 'available');
});

test('only confirmed participants can access a released link', () => {
  assert.equal(getMeetingAccess(workshop, undefined, releaseTime).url, null);
  const waiting = getMeetingAccess(workshop, { status: 'waiting' }, releaseTime);
  assert.equal(waiting.status, 'waiting-list');
  assert.equal(waiting.url, null);
  const completed = getMeetingAccess(workshop, { status: 'completed' }, releaseTime);
  assert.equal(completed.status, 'completed');
  assert.equal(completed.url, null);
});

test('no link is invented when the organizer has not provided a usable URL', () => {
  for (const meetingUrl of [undefined, null, '', '   ', 'javascript:alert(1)', 'data:text/html,test', 'not-a-url']) {
    const result = getMeetingAccess({ ...workshop, meetingUrl }, registered, releaseTime);
    assert.equal(result.status, 'pending');
    assert.equal(result.url, null);
  }
});

test('invalid dates and an invalid clock never expose the meeting link', () => {
  for (const isoDate of [undefined, '', '2026-02-30', '2026-13-01', '20-11-2026']) {
    assert.equal(getMeetingReleaseTime(isoDate), null);
    assert.equal(getMeetingAccess({ ...workshop, isoDate }, registered, releaseTime).url, null);
  }
  assert.equal(getMeetingAccess(workshop, registered, NaN).url, null);
});

test('offline and completed workshops never offer an online join action', () => {
  assert.equal(getMeetingAccess({ ...workshop, mode: 'offline' }, registered, releaseTime), null);
  assert.equal(getMeetingAccess({ ...workshop, completed: true }, registered, releaseTime).url, null);
});
