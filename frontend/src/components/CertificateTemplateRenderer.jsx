import React from 'react';
import UnandLogo from './UnandLogo';
import { Award, ShieldCheck, CheckCircle2, Bookmark } from 'lucide-react';

export default function CertificateTemplateRenderer({
  desainKey = 'klasik',
  namaKegiatan = 'Workshop Data Science untuk Riset Akademik',
  namaPeserta = 'Nadia Amelia',
  tanggal = '18 Mei 2026',
  penyelenggara = 'Universitas Andalas',
  nomorSertifikat = 'UNAND/CERT/2026/0488',
}) {
  // ── DESAIN 1: KLASIK HIJAU & GARIS EMAS ──
  if (desainKey === 'klasik') {
    return (
      <div style={{
        background: '#fdfbf7',
        border: '6px double #14532d',
        borderRadius: '8px',
        padding: '28px 24px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 6px 20px rgba(20, 83, 45, 0.08)',
        overflow: 'hidden',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>
        {/* Inner Gold Frame */}
        <div style={{
          position: 'absolute',
          inset: '6px',
          border: '1px solid #d4af37',
          pointerEvents: 'none',
          borderRadius: '4px',
        }} />

        {/* Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <UnandLogo style={{ width: '36px', height: '36px' }} />
            <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <strong style={{ fontSize: '13px', color: '#14532d', letterSpacing: '0.06em', display: 'block', fontFamily: 'Georgia, serif' }}>
                UNIVERSITAS ANDALAS
              </strong>
              <span style={{ fontSize: '10px', color: '#66736c' }}>
                Sertifikat Resmi Terverifikasi
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#14532d',
            letterSpacing: '0.12em',
            marginTop: '10px',
            textTransform: 'uppercase',
            fontFamily: 'Georgia, serif',
          }}>
            SERTIFIKAT PENGHARGAAN
          </div>
          <div style={{ width: '80px', height: '2px', background: '#d4af37', margin: '4px auto 10px' }} />
          <div style={{ fontSize: '10px', color: '#87918c', fontFamily: 'monospace' }}>
            No: {nomorSertifikat}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ margin: '14px 0' }}>
          <p style={{ fontSize: '11px', color: '#66736c', margin: '0 0 4px', fontStyle: 'italic' }}>
            Diberikan dengan hormat kepada:
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#14532d',
            margin: '0 0 8px',
            fontFamily: 'Georgia, serif',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
          }}>
            {namaPeserta}
          </p>
          <p style={{ fontSize: '11px', color: '#52605a', margin: '0 auto 6px', maxWidth: '420px', lineHeight: 1.4 }}>
            atas partisipasi dan kelulusan presensi sebagai peserta aktif dalam kegiatan:
          </p>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#263238', margin: '0 0 6px' }}>
            {namaKegiatan}
          </p>
          <p style={{ fontSize: '10.5px', color: '#87918c' }}>
            Dilaksanakan pada {tanggal} di {penyelenggara}
          </p>
        </div>

        {/* Signatures */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: '14px',
          borderTop: '1px solid #e8ede9',
        }}>
          <div>
            <p style={{ fontSize: '10px', color: '#66736c', margin: 0, fontWeight: 600 }}>Pimpinan Mitra</p>
            <div style={{ height: '26px', borderBottom: '1px solid #cbd5e1', width: '110px', margin: '4px auto' }} />
            <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>Tanda Tangan Digital</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#66736c', margin: 0, fontWeight: 600 }}>Rektor Universitas Andalas</p>
            <div style={{ height: '26px', borderBottom: '1px solid #cbd5e1', width: '110px', margin: '4px auto' }} />
            <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>Tanda Tangan Digital</p>
          </div>
        </div>
      </div>
    );
  }

  // ── DESAIN 2: MODERN MINIMALIS TEAL ──
  if (desainKey === 'modern') {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 6px 20px rgba(13, 148, 136, 0.08)',
        overflow: 'hidden',
        minHeight: '380px',
        display: 'flex',
        boxSizing: 'border-box',
      }}>
        {/* Left Teal Accent Stripe */}
        <div style={{
          width: '28px',
          background: 'linear-gradient(180deg, #0d9488 0%, #115e59 100%)',
          flexShrink: 0,
        }} />

        {/* Main Content Area */}
        <div style={{
          padding: '24px 26px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Header Row */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UnandLogo style={{ width: '32px', height: '32px' }} />
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f766e', display: 'block', letterSpacing: '0.04em' }}>
                    UNIVERSITAS ANDALAS
                  </strong>
                  <span style={{ fontSize: '9.5px', color: '#64748b' }}>Certificate of Completion</span>
                </div>
              </div>
              <span style={{
                background: '#ccfbf1',
                color: '#0f766e',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                VERIFIED DIGITAL
              </span>
            </div>

            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 2px',
            }}>
              SERTIFIKAT KELULUSAN
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
              ID: {nomorSertifikat}
            </div>
          </div>

          {/* Body */}
          <div style={{ margin: '14px 0' }}>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 4px' }}>Diberikan kepada:</p>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0f766e',
              margin: '0 0 4px',
            }}>
              {namaPeserta}
            </div>
            <div style={{ width: '50px', height: '3px', background: '#0d9488', borderRadius: '2px', marginBottom: '10px' }} />

            <p style={{ fontSize: '11.5px', color: '#334155', margin: '0 0 4px', lineHeight: 1.4 }}>
              Telah menyelesaikan seluruh rangkaian kegiatan serta presensi terverifikasi pada:
            </p>
            <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              {namaKegiatan}
            </p>
            <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}>
              Tanggal Pelaksanaan: {tanggal} · Penyelenggara: {penyelenggara}
            </p>
          </div>

          {/* Signatures */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
          }}>
            <div>
              <p style={{ fontSize: '9.5px', color: '#64748b', margin: 0 }}>Penyelenggara / Mitra</p>
              <div style={{ height: '22px', borderBottom: '1.5px solid #0d9488', width: '120px', margin: '4px 0' }} />
              <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>TTE Sah & Terdaftar</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '9.5px', color: '#64748b', margin: 0 }}>Rektor Universitas Andalas</p>
              <div style={{ height: '22px', borderBottom: '1.5px solid #0d9488', width: '120px', margin: '4px 0 4px auto' }} />
              <p style={{ fontSize: '9px', color: '#94a3b8', margin: 0 }}>TTE Sah & Terdaftar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESAIN 3: EMAS MEWAH & ROYAL ──
  if (desainKey === 'royal-gold') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fffdfa 0%, #fef8ee 50%, #fffdfa 100%)',
        border: '4px solid #b45309',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 6px 22px rgba(180, 83, 9, 0.12)',
        overflow: 'hidden',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>
        {/* Outer Fine Border */}
        <div style={{
          position: 'absolute',
          inset: '4px',
          border: '1.5px solid #f59e0b',
          borderRadius: '4px',
          pointerEvents: 'none',
        }} />

        {/* Badge Medal in Top Right */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: 700,
          boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)',
        }}>
          <Award size={12} />
          PRESTASI
        </div>

        {/* Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <UnandLogo style={{ width: '34px', height: '34px' }} />
            <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <strong style={{ fontSize: '13px', color: '#78350f', display: 'block', letterSpacing: '0.08em', fontFamily: 'Georgia, serif' }}>
                UNIVERSITAS ANDALAS
              </strong>
              <span style={{ fontSize: '9px', color: '#92400e', fontWeight: 600 }}>REPUBLIK INDONESIA</span>
            </div>
          </div>

          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#78350f',
            letterSpacing: '0.14em',
            marginTop: '8px',
            textTransform: 'uppercase',
            fontFamily: 'Georgia, serif',
          }}>
            SERTIFIKAT KOMPETENSI
          </div>
          <div style={{ fontSize: '9.5px', color: '#b45309', letterSpacing: '0.05em' }}>
            REG. NUMBER: {nomorSertifikat}
          </div>
        </div>

        {/* Body */}
        <div style={{ margin: '12px 0' }}>
          <p style={{ fontSize: '11px', color: '#78350f', margin: '0 0 4px' }}>Diberikan Sebagai Bukti Kelulusan Kepada:</p>
          <p style={{
            fontSize: '19px',
            fontWeight: 800,
            color: '#92400e',
            margin: '0 0 6px',
            fontFamily: 'Georgia, serif',
          }}>
            {namaPeserta}
          </p>
          <div style={{ width: '120px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #b45309, transparent)', margin: '0 auto 8px' }} />

          <p style={{ fontSize: '11px', color: '#57534e', margin: '0 auto 4px', maxWidth: '400px', lineHeight: 1.4 }}>
            Telah menyelesaikan dan memenuhi kualifikasi kehadiran secara penuh pada kegiatan:
          </p>
          <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#1c1917', margin: '0 0 4px' }}>
            {namaKegiatan}
          </p>
          <p style={{ fontSize: '10px', color: '#78716c' }}>
            Padang, {tanggal}
          </p>
        </div>

        {/* Signatures */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid #fed7aa',
        }}>
          <div>
            <p style={{ fontSize: '9.5px', color: '#78350f', margin: 0, fontWeight: 600 }}>Pimpinan Mitra</p>
            <div style={{ height: '24px', borderBottom: '1px solid #d97706', width: '110px', margin: '4px auto' }} />
            <p style={{ fontSize: '8.5px', color: '#a8a29e', margin: 0 }}>Digital Signature</p>
          </div>
          <div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px dashed #b45309',
              margin: '0 auto',
              display: 'grid',
              placeItems: 'center',
              color: '#b45309',
              fontSize: '8px',
              fontWeight: 800,
            }}>
              SEGEL
            </div>
          </div>
          <div>
            <p style={{ fontSize: '9.5px', color: '#78350f', margin: 0, fontWeight: 600 }}>Rektor Universitas Andalas</p>
            <div style={{ height: '24px', borderBottom: '1px solid #d97706', width: '110px', margin: '4px auto' }} />
            <p style={{ fontSize: '8.5px', color: '#a8a29e', margin: 0 }}>Digital Signature</p>
          </div>
        </div>
      </div>
    );
  }

  // ── DESAIN 4: BIRU NAVY FORMAL AKADEMIK (DEFAULT FALLBACK) ──
  return (
    <div style={{
      background: '#ffffff',
      border: '4px solid #1e3a8a',
      borderRadius: '8px',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 6px 20px rgba(30, 58, 138, 0.08)',
      overflow: 'hidden',
      minHeight: '380px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>
      {/* Top Navy Banner */}
      <div style={{
        background: '#1e3a8a',
        padding: '10px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UnandLogo style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em' }}>
            UNIVERSITAS ANDALAS
          </span>
        </div>
        <span style={{ fontSize: '9.5px', opacity: 0.85, letterSpacing: '0.04em' }}>
          OFFICIAL CERTIFICATION
        </span>
      </div>

      {/* Main Body */}
      <div style={{ padding: '18px 24px' }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 800,
          color: '#1e3a8a',
          letterSpacing: '0.1em',
          margin: '4px 0 2px',
          textTransform: 'uppercase',
        }}>
          SERTIFIKAT AKADEMIK
        </div>
        <div style={{ fontSize: '9.5px', color: '#64748b', marginBottom: '14px' }}>
          Sertifikasi Institusi Nomor: {nomorSertifikat}
        </div>

        <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 4px' }}>
          Menerangkan bahwa:
        </p>
        <p style={{
          fontSize: '18px',
          fontWeight: 800,
          color: '#1e3a8a',
          margin: '0 0 6px',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}>
          {namaPeserta}
        </p>

        <p style={{ fontSize: '11px', color: '#334155', margin: '0 auto 6px', maxWidth: '420px', lineHeight: 1.4 }}>
          Telah memenuhi seluruh kriteria presensi valid dan menyelesaikan program:
        </p>
        <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
          {namaKegiatan}
        </p>
        <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
          Diterbitkan pada {tanggal} di {penyelenggara}
        </p>
      </div>

      {/* Signatures & Seal */}
      <div style={{
        padding: '12px 24px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: '9.5px', color: '#475569', margin: 0, fontWeight: 600 }}>Pimpinan Mitra</p>
          <div style={{ height: '22px', borderBottom: '1px solid #1e3a8a', width: '110px', margin: '4px auto' }} />
          <p style={{ fontSize: '8.5px', color: '#94a3b8', margin: 0 }}>Tertanda Tangan</p>
        </div>
        <div>
          <ShieldCheck size={28} color="#1e3a8a" />
        </div>
        <div>
          <p style={{ fontSize: '9.5px', color: '#475569', margin: 0, fontWeight: 600 }}>Rektor Universitas Andalas</p>
          <div style={{ height: '22px', borderBottom: '1px solid #1e3a8a', width: '110px', margin: '4px auto' }} />
          <p style={{ fontSize: '8.5px', color: '#94a3b8', margin: 0 }}>Tertanda Tangan</p>
        </div>
      </div>
    </div>
  );
}

