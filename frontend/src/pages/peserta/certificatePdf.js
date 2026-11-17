import { getWorkshopLocation } from './data.js';
import { getCertificateFilename } from './certificates.js';

export async function createCertificatePdf(certificate, logo) {
  // Load the PDF renderer only when the participant requests a download.
  const { jsPDF } = await import('jspdf');
  const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const center = 148.5;
  const green = '#14532d';
  const issuer = certificate.issuer || 'Universitas Andalas';
  document.setProperties({ title: `Sertifikat ${certificate.number}`, author: issuer, subject: certificate.workshop.title });
  document.setDrawColor(green);
  document.setLineWidth(1.2);
  document.rect(12, 12, 273, 186);
  document.setLineWidth(0.3);
  document.rect(15, 15, 267, 180);
  if (logo) document.addImage(logo, 'PNG', center - 6, 23, 12, 15);
  document.setTextColor(green);
  document.setFont('helvetica', 'bold');
  document.setFontSize(12);
  document.text(certificate.issuerType === 'mitra' ? issuer.toUpperCase() : 'UNIVERSITAS ANDALAS', center, 46, { align: 'center' });
  document.setFontSize(28);
  document.text('SERTIFIKAT', center, 64, { align: 'center' });
  document.setFont('helvetica', 'normal');
  document.setTextColor('#66736c');
  document.setFontSize(10);
  document.text(`No. ${certificate.number}`, center, 73, { align: 'center' });
  document.text('Diberikan kepada', center, 85, { align: 'center' });
  document.setFont('times', 'bold');
  document.setTextColor(green);
  document.setFontSize(25);
  const recipient = document.splitTextToSize([certificate.recipient, certificate.degree].filter(Boolean).join(', '), 225);
  document.text(recipient, center, 100, { align: 'center' });
  const bodyY = 100 + (recipient.length - 1) * 9;
  document.setFont('helvetica', 'normal');
  document.setTextColor('#66736c');
  document.setFontSize(11);
  document.text('Atas partisipasinya sebagai peserta dalam kegiatan', center, bodyY + 11, { align: 'center' });
  document.setTextColor('#263238');
  document.setFont('helvetica', 'bold');
  document.setFontSize(14);
  const title = document.splitTextToSize(certificate.workshop.title, 225);
  document.text(title, center, bodyY + 21, { align: 'center' });
  const detailsY = bodyY + 21 + (title.length - 1) * 6 + 8;
  document.setFont('helvetica', 'normal');
  document.setTextColor('#66736c');
  document.setFontSize(10);
  document.text(`${certificate.workshop.date} · ${getWorkshopLocation(certificate.workshop)}`, center, detailsY, { align: 'center' });
  if (certificate.additionalInfo) { document.setFontSize(9); document.text(document.splitTextToSize(certificate.additionalInfo, 225), center, detailsY + 8, { align: 'center' }); }
  document.setFontSize(10);
  document.text(`Diterbitkan pada ${certificate.issued}`, center, 178, { align: 'center' });
  document.text(issuer, center, 185, { align: 'center' });
  document.setFontSize(8);
  document.text('Dokumen contoh - Prototipe Workshop UNAND', center, 193, { align: 'center' });
  return document;
}

async function loadCertificateLogo() {
  const logo = new Image();
  logo.src = `${import.meta.env.BASE_URL}logo-unand-transparent.png`;
  await logo.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = Math.round(180 * logo.naturalHeight / logo.naturalWidth);
  canvas.getContext('2d').drawImage(logo, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

export async function downloadCertificatePdf(certificate) {
  const logo = certificate.issuerType === 'mitra' ? null : await loadCertificateLogo();
  const document = await createCertificatePdf(certificate, logo);
  await document.save(getCertificateFilename(certificate), { returnPromise: true });
}
