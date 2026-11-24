import { CalendarDays, Users, UserCheck, Award, FileClock, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { reportsApi } from '../../api';
import { PageLoader, ErrorNotice } from '../../components/RequireRole';
import { useCurrentUser } from '../../context/AuthContext';
import { DashHero, StatTile, PipelineCard, TaskPanel, TrendChart, RateBars, ListCard, SertBadge } from '../../components/Dashboard';

/**
 * Dashboard Sekretariat Rektor: memantau alur penerbitan sertifikat,
 * dokumen pengganti yang tertunda, dan tingkat kehadiran kegiatan.
 */
export default function DashboardSekretariat() {
  const user = useCurrentUser();
  const { data, loading, error, reload } = useApi(() => reportsApi.dashboard(), []);

  if (loading && !data) return <PageLoader />;
  if (!data) return <ErrorNotice error={error} onRetry={reload} />;

  const { summary, pipeline, tasks, trend, kehadiran, pengajuanTerbaru } = data;

  return (
    <div className="dash-page">
      <DashHero
        title={`Selamat datang, ${user.nama?.split(' ')[0] || ''}`}
        subtitle="Pantau alur penerbitan sertifikat dan rekap kehadiran kegiatan Universitas Andalas."
      />

      <div className="dash-grid-4">
        <StatTile icon={CalendarDays} label="Total kegiatan" value={summary.totalKegiatan} hint={`${summary.kegiatanBerlangsung} sedang berlangsung`} to="/sekretariat/kegiatan" />
        <StatTile icon={Users} label="Total pendaftar" value={summary.totalPendaftar} hint={`${summary.kegiatanAkanDatang} kegiatan akan datang`} />
        <StatTile icon={UserCheck} label="Tingkat kehadiran" value={`${summary.persentaseHadir}%`} hint={`${summary.pesertaHadir} peserta hadir`} to="/sekretariat/presensi" />
        <StatTile icon={Award} label="Sertifikat terbit" value={summary.sertifikatTerbit} hint={`${pipeline.diterbitkan} kegiatan`} to="/sekretariat/sertifikat" />
      </div>

      <div className="dash-layout">
        <div className="dash-col">
          <TaskPanel
            tasks={[
              {
                key: 'pengganti', icon: FileClock, title: 'Dokumen pengganti menunggu TTE ulang', unit: 'dokumen',
                total: tasks.penggantiTertunda.total, items: tasks.penggantiTertunda.items,
                to: '/sekretariat/sertifikat-perbaikan', actionLabel: 'Lihat',
                doneText: 'tidak ada dokumen pengganti yang tertunda',
                renderItem: item => (
                  <Link to={`/sekretariat/dokumen-pengganti/${item.id}`} className="dash-item-link">
                    <span className="dash-item-main"><strong>{item.nama}</strong><small>{item.kegiatan}</small></span>
                  </Link>
                ),
              },
              {
                key: 'presensi', icon: ClipboardCheck, tone: 'info', title: 'Presensi menunggu verifikasi panitia', unit: 'bukti presensi',
                total: tasks.presensiMenunggu.total, items: tasks.presensiMenunggu.items,
                to: '/sekretariat/presensi', actionLabel: 'Rekap presensi',
                doneText: 'semua bukti presensi sudah diverifikasi',
                renderItem: item => (
                  <Link to={`/sekretariat/kegiatan/${item.id}`} className="dash-item-link">
                    <span className="dash-item-main"><strong>{item.nama}</strong><small>{item.tanggal}</small></span>
                    <span className="dash-item-num">{item.jumlah}</span>
                  </Link>
                ),
              },
            ]}
          />
          <TrendChart data={trend} />
        </div>

        <aside className="dash-col">
          <PipelineCard pipeline={pipeline} to="/sekretariat/sertifikat" vertical />
          <ListCard title="Pengajuan sertifikat terbaru" to="/sekretariat/sertifikat" empty={pengajuanTerbaru.length ? null : 'Belum ada pengajuan.'}>
            {pengajuanTerbaru.slice(0, 4).map(s => (
              <li key={s.id}>
                <Link to={`/sekretariat/sertifikat/${s.id}`} className="dash-item-link">
                  <span className="dash-item-main"><strong>{s.nama}</strong><small>{s.tanggal} · {s.jumlah} sertifikat · Sumber {s.sumber}</small></span>
                  <SertBadge status={s.status} />
                </Link>
              </li>
            ))}
          </ListCard>
          <RateBars data={kehadiran} limit={5} subtitle="Kegiatan dengan kehadiran tertinggi" linkTo={r => `/sekretariat/kegiatan/${r.id}`} />
        </aside>
      </div>
    </div>
  );
}
