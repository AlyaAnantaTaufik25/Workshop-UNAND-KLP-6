import test from 'node:test';
import assert from 'node:assert/strict';
import { canSubmitAttendance, createRegistration, getAttendanceState, getRegistrationAvailability, getRegistrationState, getRemainingSeats } from '../workshopStates.js';

const workshop = { id: 'test', remaining: 1, capacity: 20, attendanceState: 'open' };

test('closed, upcoming, cancelled, and completed workshops reject new registrations even with seats', () => {
  for (const variation of [{ registrationState: 'closed' }, { registrationState: 'not-open' }, { cancelled: true }, { completed: true }]) {
    assert.equal(createRegistration({ ...workshop, ...variation }), null);
  }
  assert.equal(createRegistration({ ...workshop, remaining: 0, waitingListEnabled: false }), null);
});

test('full workshops create a waiting entry instead of confirming a seat', () => {
  const full = { ...workshop, remaining: 0, waitingCount: 4 };
  assert.equal(getRegistrationAvailability(full), 'waiting-list');
  assert.deepEqual(createRegistration(full, undefined, 'now'), { workshopId: 'test', status: 'waiting', queue: 5, registeredAt: 'now' });
  assert.equal(getRegistrationAvailability({ ...full, waitingListEnabled: false }), 'full');
});

test('duplicate registration is prevented and rejoining the queue loses the original position', () => {
  assert.equal(createRegistration(workshop, { status: 'registered' }), null);
  assert.equal(createRegistration(workshop, { status: 'waiting' }), null);
  const rejoined = createRegistration({ ...workshop, remaining: 0, waitingCount: 4 }, { status: 'cancelled', queue: 7 });
  assert.equal(rejoined.queue, 8);
  assert.equal(createRegistration(workshop, { status: 'cancelled', attendance: { status: 'present' } }).attendance, undefined);
});

test('confirmed participants retain their status after registration closes', () => {
  const closed = { ...workshop, registrationState: 'closed' };
  assert.equal(getRegistrationState(closed, { status: 'registered' }), 'registered');
  assert.equal(getRegistrationState(closed, { status: 'waiting' }), 'waiting');
  assert.equal(getRegistrationState(closed, { status: 'cancelled' }), 'cancelled');
  assert.equal(getRegistrationState({ ...closed, cancelled: true }, { status: 'registered' }), 'event-cancelled');
});

test('seat counts follow registration and cancellation without counting waiting entries', () => {
  const entry = { workshopId: 'test', status: 'registered' };
  assert.equal(getRemainingSeats(workshop, [entry], []), 0);
  assert.equal(getRemainingSeats(workshop, [{ ...entry, status: 'waiting' }], []), 1);
  assert.equal(getRemainingSeats(workshop, [{ ...entry, status: 'cancelled' }], [entry]), 2);
  assert.equal(getRemainingSeats(workshop, [entry], [entry]), 1);
  assert.equal(getRemainingSeats({ ...workshop, remaining: 0 }, [entry], []), 0);
});

test('attendance submission requires a confirmed seat and an open session', () => {
  for (const entry of [undefined, { status: 'waiting' }, { status: 'cancelled' }, { status: 'completed' }]) {
    assert.equal(canSubmitAttendance(workshop, entry), false);
  }
  const registered = { status: 'registered' };
  assert.equal(canSubmitAttendance(workshop, registered), true);
  assert.equal(canSubmitAttendance({ ...workshop, attendanceState: 'closed' }, registered), false);
  assert.equal(canSubmitAttendance({ ...workshop, completed: true }, registered), false);
  assert.equal(canSubmitAttendance({ ...workshop, cancelled: true }, registered), false);
});

test('pending and validated attendance cannot be submitted again; rejected evidence can be corrected while open', () => {
  for (const status of ['pending', 'present', 'absent']) {
    assert.equal(canSubmitAttendance(workshop, { status: 'registered', attendance: { status } }), false);
  }
  const rejected = { status: 'registered', attendance: { status: 'rejected' } };
  assert.equal(canSubmitAttendance(workshop, rejected), true);
  assert.equal(canSubmitAttendance({ ...workshop, attendanceState: 'closed' }, rejected), false);
});

test('session closure preserves verification results and completion does not imply attendance', () => {
  const closed = { ...workshop, attendanceState: 'closed' };
  assert.equal(getAttendanceState(closed, { status: 'registered' }), 'closed');
  for (const status of ['pending', 'present', 'rejected']) {
    assert.equal(getAttendanceState(closed, { status: 'registered', attendance: { status } }), status);
  }
  assert.equal(getAttendanceState({ ...workshop, completed: true }, { status: 'completed' }), 'absent');
  assert.equal(getAttendanceState(workshop, { status: 'waiting' }), 'waiting-list');
  assert.equal(getAttendanceState(workshop, undefined), 'not-registered');
  assert.equal(getAttendanceState({ ...workshop, cancelled: true }, { status: 'registered', attendance: { status: 'present' } }), 'cancelled');
});
