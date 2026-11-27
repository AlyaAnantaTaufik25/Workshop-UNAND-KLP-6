import { useEffect, useMemo, useState } from 'react';
import {
  Mail, Phone, Building2, ShieldCheck, KeyRound, Eye, EyeOff, Check, LoaderCircle,
  UserRound, BadgeCheck, CalendarDays, Lock, IdCard, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import { dialog, toast } from './Dialog';
import Select from './Select';
import './profile.css';
import useUnsavedChanges from '../hooks/useUnsavedChanges';

/**
 * Halaman profil seragam untuk semua role.
 * Field ditentukan per role; email & NIP pegawai bersifat resmi (hanya-baca).
 */
const ROLE_CONFIG = {
  peserta: {
    intro: 'Pastikan data Anda benar — nama dan gelar dipakai pada sertifikat.',
    personal: [
      { key: 'nama', label: 'Nama lengkap', required: true, full: true, hint: 'Ditulis persis seperti pada sertifikat.' },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'telepon', label: 'Nomor HP', type: 'tel', required: true },
      { key: 'jenis', label: 'Jenis peserta', select: ['Mahasiswa', 'Dosen', 'Profesional', 'Umum'] },
      { key: 'nim', label: 'NIM', when: f => f.jenis === 'Mahasiswa', required: true },
      { key: 'prodi', label: 'Program studi', when: f => f.jenis === 'Mahasiswa', required: true, full: true },
    ],
  },
  humas: {
    intro: 'Kelola informasi akun Humas. Identitas resmi (email & NIP) diatur oleh administrator.',
    personal: [
      { key: 'nama', label: 'Nama lengkap', required: true, full: true },
      { key: 'email', label: 'Email resmi', readOnly: true },
      { key: 'telepon', label: 'Nomor telepon', type: 'tel', required: true },
      { key: 'nip', label: 'NIP', readOnly: true },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'unitKerja', label: 'Unit kerja', full: true },
    ],
  },
  sekretariat: {
    intro: 'Pastikan data Anda benar untuk kebutuhan administrasi dan penerbitan sertifikat.',
    personal: [
      { key: 'nama', label: 'Nama lengkap', required: true, full: true },
      { key: 'email', label: 'Email resmi', readOnly: true },
      { key: 'telepon', label: 'Nomor telepon', type: 'tel', required: true },
      { key: 'nip', label: 'NIP', readOnly: true },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'unitKerja', label: 'Unit kerja', full: true },
    ],
  },
  rektor: {
    intro: 'Data identitas pimpinan dan keamanan tanda tangan elektronik sertifikat resmi.',
    personal: [
      { key: 'nama', label: 'Nama lengkap & gelar', required: true, full: true, hint: 'Nama ini tercetak di bawah tanda tangan sertifikat.' },
      { key: 'email', label: 'Email resmi', readOnly: true },
      { key: 'telepon', label: 'Nomor telepon', type: 'tel', required: true },
      { key: 'nip', label: 'NIP', readOnly: true },
      { key: 'jabatan', label: 'Jabatan' },
      { key: 'unitKerja', label: 'Unit kerja', full: true },
    ],
    pin: true,
  },
  mitra: {
    intro: 'Informasi penanggung jawab dan instansi mitra kerja sama, serta keamanan tanda tangan elektronik.',
    personal: [
      { key: 'nama', label: 'Nama penanggung jawab', required: true, full: true },
      { key: 'email', label: 'Email akun', readOnly: true },
      { key: 'telepon', label: 'Nomor telepon', type: 'tel', required: true },
      { key: 'jabatan', label: 'Jabatan', full: true },
    ],
    instansi: [
      { key: 'instansi', label: 'Nama instansi', readOnly: true },
      { key: 'jenisMitra', label: 'Jenis mitra', readOnly: true },
      { key: 'bidangUsaha', label: 'Bidang usaha', full: true },
      { key: 'alamat', label: 'Alamat instansi', full: true, multiline: true },
    ],
    pin: true,
  },
};

const formatTanggal = value => {
  if (!value) return '-';
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
};

function Field({ field, value, onChange, error }) {
  const id = `profil-${field.key}`;
  return (
    <label className={`pf-field${field.full ? ' pf-field--full' : ''}${field.readOnly ? ' is-readonly' : ''}`} htmlFor={id}>
      <span className="pf-label">
        {field.label}
        {field.required && !field.readOnly && <i aria-hidden="true">*</i>}
        {field.readOnly && <Lock size={12} aria-label="Hanya-baca" />}
      </span>
      {field.select ? (
        <Select id={id} value={value} onChange={e => onChange(field.key, e.target.value)}>
          {field.select.map(o => <option key={o} value={o}>{o}</option>)}
        </Select>
      ) : field.multiline ? (
        <textarea id={id} rows={3} value={value} readOnly={field.readOnly} onChange={e => onChange(field.key, e.target.value)} />
      ) : (
        <input id={id} type={field.type || 'text'} value={value} readOnly={field.readOnly} onChange={e => onChange(field.key, e.target.value)} inputMode={field.type === 'tel' ? 'tel' : undefined} />
      )}
      {error ? <small className="pf-error">{error}</small> : field.hint && <small className="pf-hint">{field.hint}</small>}
    </label>
  );
}

function SecretInput({ id, label, value, onChange, numeric, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <label className="pf-field pf-field--full" htmlFor={id}>
      <span className="pf-label">{label}</span>
      <span className="pf-secret">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          inputMode={numeric ? 'numeric' : undefined}
          maxLength={numeric ? 6 : 128}
          onChange={e => onChange(numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
        />
        <button type="button" onClick={() => setShow(v => !v)} aria-label={show ? 'Sembunyikan' : 'Tampilkan'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );
}

/** Kartu ganti kata sandi */
function PasswordCard() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = k => v => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const submit = async e => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword) return setError('Lengkapi kata sandi lama dan baru.');
    if (form.newPassword.length < 8) return setError('Kata sandi baru minimal 8 karakter.');
    if (form.newPassword !== form.confirm) return setError('Konfirmasi kata sandi tidak cocok.');
    setSaving(true);
    try {
      await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setForm({ oldPassword: '', newPassword: '', confirm: '' });
      toast('Kata sandi berhasil diubah.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="pf-card" onSubmit={submit}>
      <header className="pf-card-head">
        <span className="pf-card-icon"><ShieldCheck size={18} /></span>
        <div><h3>Kata sandi</h3><p>Gunakan minimal 8 karakter yang sulit ditebak.</p></div>
      </header>
      <div className="pf-grid pf-grid--single">
        <SecretInput id="pw-old" label="Kata sandi saat ini" value={form.oldPassword} onChange={set('oldPassword')} autoComplete="current-password" />
        <SecretInput id="pw-new" label="Kata sandi baru" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" />
        <SecretInput id="pw-confirm" label="Ulangi kata sandi baru" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
      </div>
      {error && <p className="pf-alert" role="alert">{error}</p>}
      <div className="pf-actions">
        <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>
          {saving ? <LoaderCircle size={16} className="pf-spin" /> : <Check size={16} />}Ubah Kata Sandi
        </button>
      </div>
    </form>
  );
}

/** Kartu PIN tanda tangan elektronik (Rektor & Mitra) */
function PinCard() {
  const [form, setForm] = useState({ oldPin: '', newPin: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = k => v => { setForm(f => ({ ...f, [k]: v })); setError(''); };
  const submit = async e => {
    e.preventDefault();
    if (!/^\d{6}$/.test(form.oldPin)) return setError('PIN saat ini harus 6 digit angka.');
    if (!/^\d{6}$/.test(form.newPin)) return setError('PIN baru harus 6 digit angka.');
    if (form.newPin !== form.confirm) return setError('Konfirmasi PIN tidak cocok.');
    setSaving(true);
    try {
      await authApi.changePin(form.oldPin, form.newPin);
      setForm({ oldPin: '', newPin: '', confirm: '' });
      toast('PIN tanda tangan berhasil diperbarui.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const reset = async () => {
    const ok = await dialog.confirm({
      title: 'Reset PIN tanda tangan?',
      message: 'PIN akan dikembalikan ke PIN awal 123456. Segera ganti setelah reset demi keamanan dokumen.',
      confirmText: 'Reset PIN',
      tone: 'warning',
    });
    if (!ok) return;
    try { await authApi.resetPin(); toast('PIN dikembalikan ke 123456.'); }
    catch (err) { toast(err.message, { tone: 'error' }); }
  };
  return (
    <form className="pf-card" onSubmit={submit}>
      <header className="pf-card-head">
        <span className="pf-card-icon pf-card-icon--gold"><KeyRound size={18} /></span>
        <div><h3>PIN tanda tangan elektronik</h3><p>Dipakai setiap kali membubuhkan TTE pada sertifikat.</p></div>
      </header>
      <div className="pf-grid pf-grid--single">
        <SecretInput id="pin-old" label="PIN saat ini" value={form.oldPin} onChange={set('oldPin')} numeric autoComplete="off" />
        <SecretInput id="pin-new" label="PIN baru (6 digit)" value={form.newPin} onChange={set('newPin')} numeric autoComplete="off" />
        <SecretInput id="pin-confirm" label="Ulangi PIN baru" value={form.confirm} onChange={set('confirm')} numeric autoComplete="off" />
      </div>
      {error && <p className="pf-alert" role="alert">{error}</p>}
      <div className="pf-actions pf-actions--split">
        <button type="button" className="pf-link" onClick={reset}><RotateCcw size={14} />Lupa PIN? Reset</button>
        <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>
          {saving ? <LoaderCircle size={16} className="pf-spin" /> : <Check size={16} />}Simpan PIN
        </button>
      </div>
    </form>
  );
}

export default function ProfilePage({ role }) {
  const { user, updateProfile } = useAuth();
  const config = ROLE_CONFIG[role];
  const allFields = useMemo(() => [...config.personal, ...(config.instansi || [])], [config]);
  const fromUser = () => Object.fromEntries(allFields.map(f => [f.key, user?.[f.key] ?? '']));
  const [form, setForm] = useState(fromUser);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Sinkron saat data user dimuat ulang dari server
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setForm(fromUser()); }, [user]);

  const initial = fromUser();
  const dirty = allFields.some(f => !f.readOnly && String(form[f.key] ?? '') !== String(initial[f.key] ?? ''));
  useUnsavedChanges(dirty && !saving);
  const visible = list => list.filter(f => !f.when || f.when(form));
  const change = (key, value) => { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: undefined })); };

  const validate = () => {
    const next = {};
    visible(allFields).forEach(f => {
      if (f.readOnly) return;
      const v = String(form[f.key] ?? '').trim();
      if (f.required && !v) next[f.key] = `${f.label} wajib diisi.`;
      if (v && f.type === 'tel' && (v.replace(/\D/g, '').length < 8 || !/^\+?[\d\s()-]+$/.test(v))) next[f.key] = 'Nomor telepon tidak valid (minimal 8 digit).';
      if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) next[f.key] = 'Format email tidak valid.';
    });
    setErrors(next);
    return !Object.keys(next).length;
  };

  const save = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = Object.fromEntries(allFields.filter(f => !f.readOnly).map(f => [f.key, String(form[f.key] ?? '').trim()]));
      await updateProfile(payload);
      toast('Perubahan profil berhasil disimpan.');
    } catch (err) {
      toast(err.message, { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const subtitle = role === 'mitra'
    ? `${user.jabatan || 'Penanggung jawab'} · ${user.instansi}`
    : role === 'peserta' ? `Peserta ${user.jenis || 'Umum'}${user.prodi ? ` · ${user.prodi}` : ''}`
      : user.jabatan || user.roleLabel;

  return (
    <div className="pf-page">
      {/* ── Judul halaman (pola sama dengan halaman lain) ── */}
      <header className="pf-header">
        <h2>Profil saya</h2>
        <p>{config.intro}</p>
      </header>

      {/* ── Ringkasan akun ── */}
      <section className="pf-card pf-summary">
        <span className="pf-avatar">{user.inisial}</span>
        <div className="pf-summary-main">
          <div className="pf-hero-name">
            <h3>{user.nama}</h3>
            <span className="pf-role"><BadgeCheck size={13} />{user.roleLabel}</span>
          </div>
          <p className="pf-hero-sub">{subtitle}</p>
          <ul className="pf-hero-meta">
            <li><Mail size={14} />{user.email}</li>
            {user.telepon && <li><Phone size={14} />{user.telepon}</li>}
            {role === 'mitra' && user.instansi && <li><Building2 size={14} />{user.instansi}</li>}
          </ul>
        </div>
        <dl className="pf-summary-stats">
          <div><dt>Status</dt><dd><span className="pf-status"><i />{user.status || 'Aktif'}</span></dd></div>
          <div><dt><CalendarDays size={13} />Bergabung</dt><dd>{formatTanggal(user.createdAt)}</dd></div>
          <div><dt><IdCard size={13} />ID pengguna</dt><dd>#{String(user.id).padStart(5, '0')}</dd></div>
        </dl>
      </section>

      <div className="pf-layout">
        {/* ── Form utama ── */}
        <form className="pf-col" onSubmit={save} noValidate>
          <section className="pf-card">
            <header className="pf-card-head">
              <span className="pf-card-icon"><UserRound size={18} /></span>
              <div><h3>Informasi pribadi</h3><p>Data ini tampil pada akun dan dokumen resmi.</p></div>
            </header>
            <div className="pf-grid">
              {visible(config.personal).map(f => <Field key={f.key} field={f} value={form[f.key] ?? ''} onChange={change} error={errors[f.key]} />)}
            </div>
          </section>

          {config.instansi && (
            <section className="pf-card">
              <header className="pf-card-head">
                <span className="pf-card-icon"><Building2 size={18} /></span>
                <div><h3>Informasi instansi</h3><p>Nama & jenis mitra diatur oleh Humas UNAND.</p></div>
              </header>
              <div className="pf-grid">
                {config.instansi.map(f => <Field key={f.key} field={f} value={form[f.key] ?? ''} onChange={change} error={errors[f.key]} />)}
              </div>
            </section>
          )}

          <div className={`pf-savebar${dirty ? ' is-dirty' : ''}`}>
            <span>{dirty ? 'Ada perubahan yang belum disimpan.' : 'Semua perubahan sudah tersimpan.'}</span>
            <div>
              <button type="button" className="pf-btn pf-btn--ghost" disabled={!dirty || saving} onClick={() => { setForm(fromUser()); setErrors({}); }}>Batal</button>
              <button type="submit" className="pf-btn pf-btn--primary" disabled={!dirty || saving}>
                {saving ? <LoaderCircle size={16} className="pf-spin" /> : <Check size={16} />}Simpan Perubahan
              </button>
            </div>
          </div>
        </form>

        {/* ── Kolom samping: keamanan akun ── */}
        <aside className="pf-col">
          <PasswordCard />
          {config.pin && <PinCard />}
        </aside>
      </div>
    </div>
  );
}
