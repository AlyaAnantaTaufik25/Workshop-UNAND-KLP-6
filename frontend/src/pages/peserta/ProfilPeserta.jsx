import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { initials } from './data';

export default function ProfilPeserta() {
  const { profile, saveProfile, notify } = useOutletContext();
  const [form, setForm] = useState({ ...profile });
  const [error, setError] = useState('');
  const update = event => setForm(value => ({ ...value, [event.target.name]: event.target.value }));
  const handleSubmit = event => {
    event.preventDefault();
    const next = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    if (!next.nama || !next.email || !next.telepon || (next.jenis === 'Mahasiswa' && (!next.nim || !next.prodi))) {
      setError('Lengkapi semua data peserta sebelum menyimpan.');
      return;
    }
    if (saveProfile(next)) { setForm(next); setError(''); notify('Perubahan profil berhasil disimpan.'); }
  };
  return <div className="peserta-stack"><section className="peserta-intro"><h2>Informasi pribadi</h2><p>Pastikan data Anda benar untuk kebutuhan sertifikat.</p></section>
    <form className="peserta-profile-form" onSubmit={handleSubmit}><div className="peserta-profile-heading"><span className="peserta-avatar peserta-avatar--large">{initials(profile.nama)}</span><div><h3>{profile.nama}</h3><p>Peserta {profile.jenis}</p></div></div>
      <div className="peserta-form-grid"><label><span>Nama lengkap</span><input name="nama" autoComplete="name" value={form.nama} onChange={update} required maxLength={100} /></label><label><span>Email</span><input name="email" type="email" autoComplete="email" value={form.email} onChange={update} required maxLength={254} /></label><label><span>Jenis peserta</span><select name="jenis" value={form.jenis} onChange={update}><option>Mahasiswa</option><option>Umum</option></select></label><label><span>Nomor HP</span><input name="telepon" type="tel" autoComplete="tel" pattern="[+0-9 ()-]{8,20}" title="Nomor telepon 8 hingga 20 karakter" value={form.telepon} onChange={update} required maxLength={20} /></label>
        {form.jenis === 'Mahasiswa' && <><label><span>NIM</span><input name="nim" inputMode="numeric" value={form.nim} onChange={update} required maxLength={30} /></label><label><span>Program studi</span><input name="prodi" value={form.prodi} onChange={update} required maxLength={100} /></label></>}
      </div>{error && <p className="peserta-form-error" role="alert">{error}</p>}<div className="peserta-form-actions"><button className="peserta-button" type="submit">Simpan Perubahan</button></div>
    </form>
  </div>;
}
