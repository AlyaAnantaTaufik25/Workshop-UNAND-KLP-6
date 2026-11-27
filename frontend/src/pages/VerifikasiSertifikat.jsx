import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, LoaderCircle, Search, ShieldAlert } from 'lucide-react';
import UnandLogo from '../components/UnandLogo';
import { certificatesApi } from '../api';
import './verifikasi.css';

/**
 * Halaman publik verifikasi keaslian sertifikat (tujuan QR pada PDF sertifikat).
 * Tidak memerlukan login.
 */
export default function VerifikasiSertifikat() {
  // Nomor bisa mengandung "/" (mis. 001/UN16/WS/V/2026) sehingga memakai rute bintang
  const { '*': nomor = '' } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(nomor);
  const [state, setState] = useState({ status: nomor ? 'loading' : 'idle', data: null, error: '' });

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- ambil data dari server (sinkronisasi sistem eksternal)
    if (!nomor) { setState({ status: 'idle', data: null, error: '' }); return undefined; }
    let alive = true;
    setInput(nomor);
    setState({ status: 'loading', data: null, error: '' });
    certificatesApi.verify(nomor)
      .then(data => alive && setState({ status: 'valid', data, error: '' }))
      .catch(err => alive && setState({ status: err.status === 404 ? 'invalid' : 'error', data: null, error: err.message }));
    return () => { alive = false; };
  }, [nomor]);

  const submit = e => {
    e.preventDefault();
    const value = input.trim();
    if (value) navigate(`/verifikasi/${encodeURIComponent(value)}`);
  };

  const d = state.data;
  return (
    <div className="vf-page">
      <main className="vf-card">
        <header className="vf-head">
          <UnandLogo className="vf-logo" />
          <div>
            <strong>Verifikasi Sertifikat</strong>
            <span>Universitas Andalas · Sistem Informasi Workshop</span>
          </div>
        </header>

        <form className="vf-form" onSubmit={submit} role="search">
          <label htmlFor="vf-nomor" className="ui-sr-only">Nomor sertifikat</label>
          <Search size={17} aria-hidden="true" />
          <input id="vf-nomor" value={input} onChange={e => setInput(e.target.value)} placeholder="Masukkan nomor sertifikat, mis. 001001/UN16/WS/V/2026" autoComplete="off" />
          <button type="submit" className="ui-btn ui-btn--primary">Periksa</button>
        </form>

        {state.status === 'loading' && <p className="vf-status"><LoaderCircle size={18} className="peserta-spin" /> Memeriksa sertifikat…</p>}

        {state.status === 'idle' && <p className="vf-hint">Pindai QR pada sertifikat atau ketik nomornya untuk memastikan sertifikat diterbitkan resmi oleh Universitas Andalas.</p>}

        {state.status === 'valid' && d && (
          <section className="vf-result vf-result--valid" aria-live="polite">
            <div className="vf-result-head"><BadgeCheck size={28} /><div><strong>Sertifikat SAH</strong><span>Terdaftar di sistem Universitas Andalas</span></div></div>
            <dl className="vf-data">
              <div><dt>Nama penerima</dt><dd>{[d.recipient, d.degree].filter(Boolean).join(', ')}</dd></div>
              <div><dt>Kegiatan</dt><dd>{d.namaKegiatan}</dd></div>
              {d.tanggalKegiatan && <div><dt>Tanggal kegiatan</dt><dd>{d.tanggalKegiatan}</dd></div>}
              <div><dt>Nomor sertifikat</dt><dd className="vf-mono">{d.number}</dd></div>
              <div><dt>Diterbitkan</dt><dd>{d.issued} · {d.issuer}</dd></div>
              {d.kodeKeaslian && <div><dt>Kode keaslian</dt><dd className="vf-mono">{d.kodeKeaslian}</dd></div>}
              {d.penandatangan?.length > 0 && (
                <div><dt>Ditandatangani elektronik</dt><dd>{d.penandatangan.map(p => <span key={p.peran} className="vf-signer">{p.nama} — {p.peran}</span>)}</dd></div>
              )}
            </dl>
            <p className="vf-note">Cocokkan nama, nomor, dan kode keaslian dengan yang tercetak pada sertifikat.</p>
          </section>
        )}

        {state.status === 'invalid' && (
          <section className="vf-result vf-result--invalid" aria-live="polite">
            <div className="vf-result-head"><ShieldAlert size={28} /><div><strong>Sertifikat tidak ditemukan</strong><span>Nomor “{nomor}” tidak terdaftar.</span></div></div>
            <p className="vf-note">Periksa kembali penulisan nomor. Bila sertifikat tetap tidak ditemukan, kemungkinan dokumen tersebut tidak diterbitkan oleh Universitas Andalas.</p>
          </section>
        )}

        {state.status === 'error' && <p className="vf-status vf-status--error" role="alert">{state.error}</p>}

        <footer className="vf-foot"><Link to="/">Masuk ke portal Workshop UNAND</Link></footer>
      </main>
    </div>
  );
}
