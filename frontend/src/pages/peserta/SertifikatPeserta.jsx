import { useState } from 'react';
import { Award, Download, Printer } from 'lucide-react';
import { getWorkshopLocation, participantCertificates, participantWorkshops } from './data';
import { EmptyState, Modal, Status } from './components';
import UnandLogo from '../../components/UnandLogo';

export default function SertifikatPeserta() {
  const [selected, setSelected] = useState(null);
  return <div className="peserta-stack"><section className="peserta-intro"><h2>Sertifikat Anda</h2><p>Unduh sertifikat dari workshop yang telah selesai.</p></section>
    {participantCertificates.length ? participantCertificates.map(certificate => {
      const workshop = participantWorkshops.find(item => item.id === certificate.workshopId);
      return <article className="peserta-certificate-row" key={certificate.id}><div className="peserta-certificate-icon"><Award size={30} /></div><div><Status>Diterbitkan</Status><h3>{workshop.title}</h3><p>No. {certificate.number} &middot; Terbit {certificate.issued}</p></div><button className="peserta-button" onClick={() => setSelected({ ...certificate, workshop })}><Download size={18} />Unduh PDF</button></article>;
    }) : <EmptyState icon={Award} title="Belum ada sertifikat tersedia">Sertifikat akan muncul setelah kehadiran Anda divalidasi dan dokumen diterbitkan.</EmptyState>}
    {selected && <Modal title="Sertifikat Workshop" wide onClose={() => setSelected(null)}><div className="peserta-modal-body"><div className="peserta-certificate-preview"><div className="peserta-certificate-brand"><UnandLogo className="peserta-brandmark" /><strong>UNIVERSITAS ANDALAS</strong></div><span>SERTIFIKAT</span><p>No. {selected.number}</p><p>Diberikan kepada</p><h2>{selected.recipient}</h2><p>Atas partisipasinya sebagai peserta dalam kegiatan</p><h3>{selected.workshop.title}</h3><p>{selected.workshop.date} &middot; {getWorkshopLocation(selected.workshop)}</p><div className="peserta-certificate-issued">Diterbitkan pada {selected.issued}<br />Universitas Andalas</div></div></div><footer><button className="peserta-button peserta-button--secondary" onClick={() => setSelected(null)}>Tutup</button><button className="peserta-button" onClick={() => window.print()}><Printer size={18} />Cetak / Simpan PDF</button></footer></Modal>}
  </div>;
}
