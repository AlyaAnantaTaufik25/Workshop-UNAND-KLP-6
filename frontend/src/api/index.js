import client from './client';

/** Endpoint REST API SIM Workshop UNAND (lihat docs/api-contract.md) */

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: data => client.post('/auth/register', data),
  me: () => client.get('/auth/me'),
  updateMe: data => client.put('/auth/me', data),
  changePassword: data => client.put('/auth/me/password', data),
  verifyPin: pin => client.post('/auth/me/pin/verify', { pin }),
  changePin: (oldPin, newPin) => client.put('/auth/me/pin', { oldPin, newPin }),
  resetPin: () => client.post('/auth/me/pin/reset'),
};

export const workshopsApi = {
  list: params => client.get('/workshops', { params }),
  get: id => client.get(`/workshops/${id}`),
  create: data => client.post('/workshops', data),
  update: (id, data) => client.put(`/workshops/${id}`, data),
  setStatus: (id, data) => client.patch(`/workshops/${id}/status`, data),
  remove: id => client.delete(`/workshops/${id}`),
};

export const registrationsApi = {
  register: workshopId => client.post('/registrations', { workshopId }),
  cancel: registrationId => client.patch(`/registrations/${registrationId}/cancel`),
  my: () => client.get('/registrations/my'),
  list: params => client.get('/registrations', { params }),
  byWorkshop: workshopId => client.get(`/registrations/workshop/${workshopId}`),
};

export const attendanceApi = {
  checkIn: data => client.post('/attendance/check-in', data),
  upload: data => client.post('/attendance/upload', data),
  generateQr: (workshopId, minutes) => client.post('/attendance/generate-qr', { workshopId, minutes }),
  verify: (id, status, reason) => client.patch(`/attendance/${id}/verify`, { status, reason }),
  byWorkshop: workshopId => client.get(`/attendance/workshop/${workshopId}`),
};

export const partnersApi = {
  list: () => client.get('/partners'),
  get: id => client.get(`/partners/${id}`),
  create: data => client.post('/partners', data),
  update: (id, data) => client.put(`/partners/${id}`, data),
  remove: id => client.delete(`/partners/${id}`),
};

export const locationsApi = {
  list: () => client.get('/locations'),
  create: data => client.post('/locations', data),
  update: (id, data) => client.put(`/locations/${id}`, data),
  remove: id => client.delete(`/locations/${id}`),
};

export const usersApi = {
  list: params => client.get('/users', { params }),
  create: data => client.post('/users', data),
  update: (id, data) => client.put(`/users/${id}`, data),
  setStatus: (id, status) => client.patch(`/users/${id}/status`, { status }),
};

export const certificatesApi = {
  templates: params => client.get('/certificates/templates', { params }),
  createTemplate: data => client.post('/certificates/templates', data),
  updateTemplate: (id, data) => client.put(`/certificates/templates/${id}`, data),
  deleteTemplate: id => client.delete(`/certificates/templates/${id}`),
  templateFile: id => client.get(`/certificates/templates/${id}/file`),

  submissions: () => client.get('/certificates/submissions'),
  submission: id => client.get(`/certificates/submissions/${id}`),
  submit: data => client.post('/certificates/submissions', data),
  sign: (id, pin, signature) => client.post(`/certificates/submissions/${id}/sign`, { pin, signature }),
  verifySubmission: (id, data) => client.patch(`/certificates/submissions/${id}/verify`, data),

  my: () => client.get('/certificates/my'),
  verify: nomor => client.get(`/certificates/verify/${encodeURIComponent(nomor)}`),

  corrections: () => client.get('/certificates/corrections'),
  createCorrection: data => client.post('/certificates/corrections', data),
  cancelCorrection: id => client.patch(`/certificates/corrections/${id}/cancel`),
  markCorrectionsRead: id => client.patch('/certificates/corrections/read', { id }),
  processCorrection: (id, data) => client.patch(`/certificates/corrections/${id}/process`, data),

  replacements: () => client.get('/certificates/replacements'),
  replacement: id => client.get(`/certificates/replacements/${id}`),
  signReplacement: (id, pin) => client.post(`/certificates/replacements/${id}/sign`, { pin }),
  approveReplacement: id => client.post(`/certificates/replacements/${id}/approve`),
};

export const reportsApi = {
  dashboard: () => client.get('/reports/dashboard'),
  summary: () => client.get('/reports/summary'),
  workshops: () => client.get('/reports/workshops'),
  daily: () => client.get('/reports/daily'),
};

export const notificationsApi = {
  list: () => client.get('/notifications'),
  markRead: id => client.patch('/notifications/read', { id }),
};

/** Membaca File menjadi data URL (base64) untuk diunggah */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Berkas tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  });
}
