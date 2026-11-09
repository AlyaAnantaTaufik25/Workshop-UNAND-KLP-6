import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Search, SearchX, Users, Video } from 'lucide-react';
import { participantWorkshops } from './data';
import { EmptyState, Status, WorkshopMode } from './components';

export default function CariWorkshop() {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState('');

  const available = participantWorkshops.filter(workshop => !workshop.completed);
  const totalCount = available.length;
  const offlineCount = available.filter(w => w.mode === 'offline').length;
  const onlineCount = available.filter(w => w.mode === 'online').length;

  const filtered = useMemo(() => available.filter(workshop => {
    const matchSearch = `${workshop.title} ${workshop.speaker}`.toLocaleLowerCase('id-ID').includes(search.trim().toLocaleLowerCase('id-ID'));
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const day = new Date(`${workshop.isoDate}T12:00:00`);
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + (7 - (start.getDay() + 6) % 7));
    const matchDate = !date || (date === 'week' ? day >= start && day < end : day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear());
    return matchSearch && (!theme || workshop.theme === theme) && matchDate && (!mode || workshop.mode === mode);
  }), [available, search, theme, date, mode]);

  const filteredOffline = filtered.filter(w => w.mode === 'offline');
  const filteredOnline = filtered.filter(w => w.mode === 'online');

  const reset = () => { setSearch(''); setTheme(''); setDate(''); setMode(''); };

  const renderCard = (workshop) => (
    <article className="peserta-workshop-card" key={workshop.id}>
      <img src={workshop.image} alt={`Suasana kegiatan ${workshop.title}`} />
      <div className="peserta-card-body">
        <div className="peserta-card-meta">
          <div className="peserta-card-context">
            <span className="peserta-card-theme">{workshop.theme}</span>
            <WorkshopMode mode={workshop.mode} />
          </div>
          <Status tone={workshop.closing ? 'amber' : 'green'}>{workshop.closing ? 'Segera tutup' : 'Pendaftaran buka'}</Status>
        </div>
        <h3>{workshop.title}</h3>
        <div className="peserta-facts">
          <p><CalendarDays size={17} /><span>{workshop.date} &middot; {workshop.time}</span></p>
          <p>{workshop.mode === 'online' ? <Video size={17} /> : <MapPin size={17} />}<span>{workshop.place}</span></p>
          <p><Users size={17} /><span>{workshop.quota}</span></p>
        </div>
        <Link className="peserta-button peserta-button--secondary" to={`/peserta/workshop/${workshop.id}`}>Lihat Detail</Link>
      </div>
    </article>
  );

  return (
    <div className="peserta-stack">
      <section className="peserta-intro">
        <h2>Temukan workshop untuk berkembang</h2>
        <p>Jelajahi kegiatan terbaru dari Universitas Andalas dan mitra berdasarkan kategori pelaksanaan.</p>
      </section>

      {/* Tabs Kategori Pelaksanaan Offline & Online */}
      <div className="peserta-category-bar" role="tablist" aria-label="Kategori Pelaksanaan Workshop & Seminar">
        <button
          type="button"
          role="tab"
          aria-selected={mode === ''}
          className={`peserta-category-pill${mode === '' ? ' is-active' : ''}`}
          onClick={() => setMode('')}
        >
          <span>Semua Kategori</span>
          <span className="peserta-category-badge-count">{totalCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'offline'}
          className={`peserta-category-pill${mode === 'offline' ? ' is-active' : ''}`}
          onClick={() => setMode('offline')}
        >
          <MapPin size={16} />
          <span>Offline (Tatap Muka)</span>
          <span className="peserta-category-badge-count">{offlineCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'online'}
          className={`peserta-category-pill${mode === 'online' ? ' is-active' : ''}`}
          onClick={() => setMode('online')}
        >
          <Video size={16} />
          <span>Online (Daring)</span>
          <span className="peserta-category-badge-count">{onlineCount}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <section className="peserta-filterbar" aria-label="Filter workshop">
        <label className="peserta-searchbox">
          <Search size={20} />
          <input
            type="search"
            aria-label="Cari judul atau pemateri"
            placeholder="Cari judul atau pemateri..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </label>
        <select aria-label="Tema workshop" value={theme} onChange={event => setTheme(event.target.value)}>
          <option value="">Semua tema</option>
          {[...new Set(available.map(workshop => workshop.theme))].map(value => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Kategori mode pelaksanaan" value={mode} onChange={event => setMode(event.target.value)}>
          <option value="">Semua mode</option>
          <option value="offline">Offline (Tatap Muka)</option>
          <option value="online">Online (Daring)</option>
        </select>
        <select aria-label="Tanggal workshop" value={date} onChange={event => setDate(event.target.value)}>
          <option value="">Semua tanggal</option>
          <option value="week">Minggu ini</option>
          <option value="month">Bulan ini</option>
        </select>
      </section>

      {/* Grouped Workshop Sections */}
      {filtered.length ? (
        <div className="peserta-stack" style={{ gap: '32px' }}>
          {/* Section Kategori Offline */}
          {(mode === '' || mode === 'offline') && filteredOffline.length > 0 && (
            <section className="peserta-category-group">
              <div className="peserta-category-heading-box">
                <div className="peserta-category-heading-left">
                  <div className="peserta-category-icon-box peserta-category-icon-box--offline">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3>Seminar & Workshop Offline (Tatap Muka)</h3>
                    <p>Diselenggarakan langsung di lingkungan kampus Universitas Andalas.</p>
                  </div>
                </div>
                <span className="peserta-category-meta-badge peserta-category-meta-badge--offline">
                  {filteredOffline.length} kegiatan
                </span>
              </div>
              <div className="peserta-workshop-grid">
                {filteredOffline.map(renderCard)}
              </div>
            </section>
          )}

          {/* Section Kategori Online */}
          {(mode === '' || mode === 'online') && filteredOnline.length > 0 && (
            <section className="peserta-category-group">
              <div className="peserta-category-heading-box">
                <div className="peserta-category-heading-left">
                  <div className="peserta-category-icon-box peserta-category-icon-box--online">
                    <Video size={20} />
                  </div>
                  <div>
                    <h3>Seminar & Webinar Online (Daring)</h3>
                    <p>Diselenggarakan secara daring interaktif melalui Zoom Meeting.</p>
                  </div>
                </div>
                <span className="peserta-category-meta-badge peserta-category-meta-badge--online">
                  {filteredOnline.length} kegiatan
                </span>
              </div>
              <div className="peserta-workshop-grid">
                {filteredOnline.map(renderCard)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Workshop tidak ditemukan"
          action={<button className="peserta-button peserta-button--secondary" onClick={reset}>Reset Filter</button>}
        >
          Coba kata kunci, kategori, tema, atau tanggal yang berbeda.
        </EmptyState>
      )}
    </div>
  );
}
