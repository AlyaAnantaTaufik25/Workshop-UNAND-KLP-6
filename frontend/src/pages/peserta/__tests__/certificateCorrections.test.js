import test from 'node:test';
import assert from 'node:assert/strict';
import { createCorrection, getCertificateVersions, isCorrectionRecord, MAX_ATTACHMENT_SIZE, validateAttachment, validateCorrection } from '../certificateCorrections.js';
import { initialCertificateCorrections } from './fixtures/certificateExamples.js';
import { getIssuedCertificates, getCertificateFilename } from '../certificates.js';
import { initialRegistrations, participantWorkshops, participantCertificates } from './fixtures/data.js';

const certificate = { id: 'test', recipient: 'Nadia Amelia', issuer: 'UNAND', issuerType: 'unand', number: 'TEST/1', issued: '18 April 2026', workshop: { title: 'Workshop Penelitian' } };
const payload = { changes: [{ field: 'recipient', newValue: 'Nadia Amelia Putri' }], reason: 'Nama belum sesuai dengan identitas peserta.', agreed: true };
const options = { id: 'PB-test', now: '2026-11-17T09:00:00+07:00' };

test('participant submissions only create pending requests and preserve the issued certificate', () => {
  const before = JSON.stringify(certificate);
  const result = createCorrection(certificate, { ...payload, status: 'selesai' }, [], options);
  assert.equal(result.ok, true);
  assert.equal(result.request.status, 'menunggu');
  assert.equal(result.request.issuer, 'UNAND');
  assert.equal(result.request.changes[0].oldValue, 'Nadia Amelia');
  assert.equal(JSON.stringify(certificate), before);
  assert.equal(getCertificateVersions(certificate, [result.request])[0].recipient, 'Nadia Amelia');
});

test('duplicate active requests are blocked and rejected or cancelled requests can be resubmitted', () => {
  for (const status of ['menunggu', 'diproses']) assert.equal(createCorrection(certificate, payload, [{ certificateId: 'test', status }], options).ok, false);
  for (const status of ['ditolak', 'dibatalkan', 'selesai']) assert.equal(createCorrection(certificate, payload, [{ certificateId: 'test', status }], options).ok, true);
});

test('correction validation rejects unchanged, unknown, duplicate, oversized, or unconsented changes', () => {
  for (const next of [
    { changes: [] }, { changes: [{ field: 'recipient', newValue: ' Nadia Amelia ' }] },
    { changes: [{ field: 'issuer', newValue: 'Other issuer' }] }, { changes: [{ field: '__proto__', newValue: 'bad' }] },
    { changes: [{ field: 'recipient', newValue: 'A'.repeat(101) }] },
    { changes: [payload.changes[0], payload.changes[0]] }, { agreed: false }, { reason: ' ' },
  ]) assert.ok(validateCorrection(certificate, { ...payload, ...next }, []));
});

test('attachments must be bounded supported files with readable matching data', () => {
  assert.ok(validateAttachment({ name: 'file.exe', type: 'application/octet-stream', size: 100 }));
  assert.ok(validateAttachment({ name: 'large.pdf', type: 'application/pdf', size: MAX_ATTACHMENT_SIZE + 1 }));
  assert.ok(validateAttachment({ name: 'empty.pdf', type: 'application/pdf', size: 0 }));
  const attachment = { name: 'identitas.pdf', type: 'application/pdf', size: 5, dataUrl: 'data:application/pdf;base64,JVBERi0=' };
  assert.equal(createCorrection(certificate, { ...payload, attachment }, [], options).ok, true);
  assert.equal(createCorrection(certificate, { ...payload, attachment: { ...attachment, dataUrl: 'data:image/png;base64,AAAA' } }, [], options).ok, false);
});

test('only issuer-completed responses produce a replacement; earlier versions remain immutable', () => {
  const result = createCorrection(certificate, payload, [], options).request;
  const completed = { ...result, status: 'selesai', replacementNumber: 'TEST/1-R1', replacementIssued: '18 November 2026' };
  const versions = getCertificateVersions(certificate, [completed, { ...result, status: 'ditolak' }]);
  assert.equal(versions.length, 2);
  assert.equal(versions[0].recipient, 'Nadia Amelia');
  assert.equal(versions[1].recipient, 'Nadia Amelia Putri');
  assert.equal(versions[1].number, 'TEST/1-R1');
  assert.equal(getCertificateFilename(versions[1]), 'sertifikat-workshop-unand-test-v2.pdf');
  assert.equal(certificate.recipient, 'Nadia Amelia');
});

test('example records cover both issuers and all processing outcomes and survive storage serialization', () => {
  const ids = participantCertificates.map(item => item.id);
  const roundTrip = JSON.parse(JSON.stringify(initialCertificateCorrections));
  assert.ok(roundTrip.every(item => isCorrectionRecord(item, ids)));
  assert.equal(new Set(roundTrip.map(item => item.status)).size, 4);
  const issued = getIssuedCertificates(participantWorkshops, initialRegistrations, participantCertificates);
  assert.equal(issued.find(item => item.id === 'mitra-004').issuer, 'PT Semen Padang');
  const original = issued.find(item => item.id === 'unand-1005');
  assert.equal(getCertificateVersions(original, roundTrip).at(-1).recipient, 'Nadia Amelia');
  assert.equal(getCertificateVersions(original, roundTrip)[0].recipient, 'Nadia Amela');
  assert.equal(roundTrip.filter(item => !item.notificationRead && ['selesai', 'ditolak'].includes(item.status)).length, 2);
});
