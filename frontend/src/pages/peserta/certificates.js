export function getIssuedCertificates(workshops, registrations, certificates = []) {
  return certificates.flatMap(certificate => {
    const workshop = workshops.find(item => item.id === certificate.workshopId);
    const registration = registrations.find(item => item.workshopId === certificate.workshopId);
    if (!workshop || workshop.cancelled || !certificate.number || !certificate.issued || !certificate.recipient
      || !['registered', 'completed'].includes(registration?.status)
      || registration.attendance?.status !== 'present'
      || (!workshop.completed && registration.status !== 'completed')) return [];
    return [{ ...certificate, workshop }];
  });
}

export function getCertificateFilename(certificate) {
  const safeId = String(certificate.id).replace(/[^a-z0-9-]/gi, '-');
  return `sertifikat-workshop-unand-${safeId}${certificate.revision > 1 ? `-v${certificate.revision}` : ''}.pdf`;
}
