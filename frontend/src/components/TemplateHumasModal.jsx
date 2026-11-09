import { useState } from 'react';
import { X, Search, Check, Eye, Palette } from 'lucide-react';
import { humasTemplates } from '../data/mockData';
import CertificateTemplateRenderer from './CertificateTemplateRenderer';

export default function TemplateHumasModal({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
  activityName = 'Workshop Data Science untuk Riset Akademik',
}) {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  if (!isOpen) return null;

  const filtered = humasTemplates.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.nama.toLowerCase().includes(q) ||
                        t.kategori.toLowerCase().includes(q) ||
                        t.deskripsi.toLowerCase().includes(q);
    const matchKategori = filterKategori ? t.kategori === filterKategori : true;
    return matchSearch && matchKategori;
  });

  const categories = Array.from(new Set(humasTemplates.map(t => t.kategori)));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '940px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        border: '1px solid #dfe6e1',
      }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #dfe6e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: '#fafbfb',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                background: '#edf7ef',
                color: '#14532d',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Palette size={12} />
                Pilihan Desain Template
              </span>
              <span style={{ fontSize: '12px', color: '#66736c' }}>
                Tersedia {humasTemplates.length} Desain Siap Pakai
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#263238', margin: 0 }}>
              Pilih Desain Template Sertifikat
            </h2>
            <p style={{ fontSize: '13px', color: '#66736c', margin: '4px 0 0' }}>
              Pilih format dan gaya tampilan visual sertifikat yang sesuai untuk kegiatan ini.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#66736c',
              padding: '4px',
              borderRadius: '6px',
            }}
            title="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid #dfe6e1',
          display: 'flex',
          gap: '12px',
          background: '#ffffff',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#87918c' }} />
            <input
              type="text"
              placeholder="Cari gaya atau kategori desain..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px 0 36px',
                border: '1px solid #d5ddd8',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
            style={{
              height: '38px',
              padding: '0 32px 0 12px',
              border: '1px solid #d5ddd8',
              borderRadius: '8px',
              fontSize: '13px',
              background: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Grid Template List dengan Mini Preview */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '18px',
          background: '#f7f8fa',
        }}>
          {filtered.map(t => {
            const isSelected = selectedTemplateId === t.id || selectedTemplateId === t.nama;
            return (
              <div
                key={t.id}
                style={{
                  background: '#ffffff',
                  border: isSelected ? '2px solid #228b45' : '1px solid #dfe6e1',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? '0 4px 16px rgba(34, 139, 69, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#14532d',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 2,
                  }}>
                    <Check size={12} /> Digunakan
                  </div>
                )}

                <div>
                  {/* Visual Miniature Preview Bar */}
                  <div
                    onClick={() => setPreviewTemplate(t)}
                    style={{
                      height: '80px',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: t.desainKey === 'klasik' ? '#fdfbf7' :
                                  t.desainKey === 'modern' ? '#ffffff' :
                                  t.desainKey === 'royal-gold' ? '#fef8ee' : '#f8fafc',
                      borderLeft: t.desainKey === 'modern' ? '8px solid #0d9488' : undefined,
                      borderTop: t.desainKey === 'navy-formal' ? '8px solid #1e3a8a' : undefined,
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s ease',
                    }}
                    title="Klik untuk melihat pratinjau besar"
                  >
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: t.warnaUtama || '#14532d',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}>
                      {t.nama}
                    </span>
                    <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                      Klik untuk pratinjau
                    </span>
                  </div>

                  {/* Kategori */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#edf7ef',
                      color: '#14532d',
                      textTransform: 'uppercase',
                    }}>
                      {t.kategori}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#f0f2f1',
                      color: '#52605a',
                    }}>
                      {t.orientasi}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#263238',
                    margin: '0 0 6px',
                    lineHeight: 1.4,
                  }}>
                    {t.nama}
                  </h3>

                  <p style={{
                    fontSize: '12px',
                    color: '#66736c',
                    margin: '0 0 14px',
                    lineHeight: 1.5,
                  }}>
                    {t.deskripsi}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Tombol Preview */}
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(t)}
                      style={{
                        flex: 1,
                        height: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#52605a',
                        background: '#f4f7f5',
                        border: '1px solid #dfe6e1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={13} />
                      Lihat Desain
                    </button>

                    {/* Tombol Terapkan */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplate(t);
                        onClose();
                      }}
                      style={{
                        flex: 1.3,
                        height: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isSelected ? '#14532d' : '#ffffff',
                        background: isSelected ? '#edf7ef' : '#14532d',
                        border: isSelected ? '1px solid #228b45' : 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {isSelected ? 'Terpilih' : 'Gunakan Desain'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #dfe6e1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fafbfb',
        }}>
          <span style={{ fontSize: '12px', color: '#66736c' }}>
            Desain template yang dipilih akan langsung diterapkan pada dokumen penerbitan sertifikat.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: '1px solid #d5ddd8',
              background: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              color: '#263238',
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        </div>

      </div>

      {/* ── MODAL PRATINJAU DESAIN LENGKAP ── */}
      {previewTemplate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '720px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #dfe6e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafbfb',
            }}>
              <div>
                <span style={{ fontSize: '10px', color: '#228b45', fontWeight: 700, textTransform: 'uppercase' }}>
                  Pratinjau Desain Template
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#263238' }}>{previewTemplate.nama}</h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#66736c' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Render Komponen Sertifikat Sesuai Desain Key */}
            <div style={{ padding: '24px', background: '#e5e9e6' }}>
              <CertificateTemplateRenderer
                desainKey={previewTemplate.desainKey}
                namaKegiatan={activityName}
                namaPeserta="Nadia Amelia"
                tanggal="18 Mei 2026"
                penyelenggara="Universitas Andalas"
              />
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #dfe6e1',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: '#fafbfb',
            }}>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #d5ddd8',
                  background: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Tutup Pratinjau
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                  onClose();
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#14532d',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Gunakan Desain Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
