import { useCallback, useRef, useState } from 'react';
import { initialCertificateCorrections } from './certificateExamples.js';
import { participantCertificates } from './data.js';
import { CORRECTIONS_STORAGE_KEY, createCorrection, isCorrectionRecord } from './certificateCorrections.js';

function loadCorrections() {
  try {
    const saved = JSON.parse(localStorage.getItem(CORRECTIONS_STORAGE_KEY));
    const ids = participantCertificates.map(item => item.id);
    if (Array.isArray(saved) && new Set(saved.map(item => item?.id)).size === saved.length && saved.every(item => isCorrectionRecord(item, ids))) return saved;
  } catch { /* Use the example records when browser storage is unavailable. */ }
  return initialCertificateCorrections;
}

export default function useCertificateCorrections() {
  const [corrections, setCorrections] = useState(loadCorrections);
  const current = useRef(corrections);
  const persist = useCallback(next => {
    try {
      localStorage.setItem(CORRECTIONS_STORAGE_KEY, JSON.stringify(next));
      current.current = next;
      setCorrections(next);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Pengajuan belum tersimpan. Penyimpanan browser mungkin penuh atau tidak diizinkan. Coba lagi atau hapus lampiran.' };
    }
  }, []);
  const submitCorrection = useCallback((certificate, payload) => {
    const result = createCorrection(certificate, payload, current.current);
    if (!result.ok) return result;
    const saved = persist([result.request, ...current.current]);
    return saved.ok ? result : saved;
  }, [persist]);
  const cancelCorrection = useCallback(id => {
    const request = current.current.find(item => item.id === id);
    if (request?.status !== 'menunggu') return { ok: false, message: 'Pengajuan sudah diproses dan tidak dapat dibatalkan.' };
    const now = new Date().toISOString();
    return persist(current.current.map(item => item.id === id ? { ...item, status: 'dibatalkan', updatedAt: now, events: [...item.events, { status: 'dibatalkan', at: now, note: 'Pengajuan dibatalkan oleh peserta.' }] } : item));
  }, [persist]);
  const markCorrectionRead = useCallback(id => {
    if (!current.current.some(item => !item.notificationRead && (!id || item.id === id) && ['selesai', 'ditolak'].includes(item.status))) return { ok: true };
    return persist(current.current.map(item => (!id || item.id === id) && ['selesai', 'ditolak'].includes(item.status) ? { ...item, notificationRead: true } : item));
  }, [persist]);
  return { corrections, submitCorrection, cancelCorrection, markCorrectionRead };
}
