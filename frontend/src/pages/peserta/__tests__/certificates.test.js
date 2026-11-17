import test from 'node:test';
import assert from 'node:assert/strict';
import { getCertificateFilename, getIssuedCertificates } from '../certificates.js';
import { initialRegistrations, participantWorkshops } from '../data.js';

const workshop = { id: 'test', completed: true };
const certificate = { id: '042', workshopId: 'test', number: '042/UN16/WS/IV/2025', issued: '18 April 2025', recipient: 'Nadia Amelia' };
const registration = { workshopId: 'test', status: 'completed', attendance: { status: 'present' } };

test('only published certificates for completed workshops with validated attendance are returned', () => {
  assert.equal(getIssuedCertificates([workshop], [registration], [certificate]).length, 1);
  for (const status of ['pending', 'rejected', 'absent']) {
    assert.deepEqual(getIssuedCertificates([workshop], [{ ...registration, attendance: { status } }], [certificate]), []);
  }
  for (const status of ['cancelled', 'waiting']) {
    assert.deepEqual(getIssuedCertificates([workshop], [{ ...registration, status }], [certificate]), []);
  }
  assert.deepEqual(getIssuedCertificates([{ ...workshop, completed: false }], [{ ...registration, status: 'registered' }], [certificate]), []);
});

test('attendance alone does not issue a document and missing or cancelled workshops are excluded', () => {
  assert.deepEqual(getIssuedCertificates([workshop], [registration], []), []);
  assert.deepEqual(getIssuedCertificates([workshop], [], [certificate]), []);
  assert.deepEqual(getIssuedCertificates([], [registration], [certificate]), []);
  assert.deepEqual(getIssuedCertificates([{ ...workshop, cancelled: true }], [registration], [certificate]), []);
  assert.deepEqual(getIssuedCertificates([workshop], [registration], [{ ...certificate, issued: '' }]), []);
});

test('the reference certificate retains its issued recipient and identifies the completed workshop', () => {
  const certificates = getIssuedCertificates(participantWorkshops, initialRegistrations);
  const original = certificates.find(item => item.id === '042');
  assert.equal(original.number, certificate.number);
  assert.equal(original.recipient, 'Nadia Amelia');
  assert.equal(original.workshop.title, 'Public Speaking untuk Profesional Muda');
  assert.equal(getCertificateFilename(original), 'sertifikat-workshop-unand-042.pdf');
});
