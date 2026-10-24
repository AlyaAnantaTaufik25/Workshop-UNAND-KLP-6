const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Key paths for TTE (Tanda Tangan Elektronik)
const KEY_DIR = path.join(__dirname, 'keys');
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'tte_private.pem');
const PUBLIC_KEY_PATH = path.join(KEY_DIR, 'tte_public.pem');

// Initialize key pair if not exists
function initCryptoKeys() {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
    console.log('[CRYPTO] RSA-2048 Key Pair for TTE generated successfully.');
  }
}

// Get public key PEM (can be safely published/sent to client)
function getPublicKeyPem() {
  return fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
}

// Canonical JSON serializer for deterministic SHA-256 hash and TTE
function buildCanonicalCertPayload(data) {
  const normalized = {
    certificateNumber: String(data.certificateNumber || data.certificate_number || ''),
    issueDate: String(data.issueDate || data.issue_date || ''),
    issuer: 'Departemen Sistem Informasi FTI Universitas Andalas',
    nimOrOrg: String(data.nimOrOrg || data.recipient_nim || data.nim || data.instansi || '-'),
    recipientName: String(data.recipientName || data.recipient_name || ''),
    signerRektor: String(data.signerRektor || data.signer_rektor || ''),
    signerSekretariat: String(data.signerSekretariat || data.signer_sekretariat || ''),
    workshopTitle: String(data.workshopTitle || data.workshop_title || '')
  };
  if (data.signerMitra || data.signer_mitra) {
    normalized.signerMitra = String(data.signerMitra || data.signer_mitra);
  }
  return JSON.stringify(normalized);
}

// Compute standard SHA-256 digest of payload
function computePayloadHash(payload) {
  const normalizedString = typeof payload === 'string' ? payload : buildCanonicalCertPayload(payload);
  return crypto.createHash('sha256').update(normalizedString, 'utf8').digest('hex');
}

// Sign payload hash using server private key
function signPayload(payload) {
  const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
  const payloadString = typeof payload === 'string' ? payload : buildCanonicalCertPayload(payload);
  const hash = computePayloadHash(payloadString);

  const sign = crypto.createSign('SHA256');
  sign.update(hash);
  sign.end();

  const signature = sign.sign(privateKey, 'base64');
  return {
    hash,
    signature,
    payloadString,
    algorithm: 'RSASSA-PKCS1-v1_5-SHA256',
    signedAt: new Date().toISOString()
  };
}

// Verify signature using public key and payload
function verifySignature(payload, signatureBase64, expectedHash = null) {
  try {
    const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
    const payloadString = typeof payload === 'string' ? payload : buildCanonicalCertPayload(payload);
    const calculatedHash = computePayloadHash(payloadString);

    if (expectedHash && calculatedHash !== expectedHash) {
      return {
        valid: false,
        reason: 'HASH_MISMATCH',
        message: 'Isi data dokumen telah diubah atau tidak sesuai dengan hash asli.'
      };
    }

    const verify = crypto.createVerify('SHA256');
    verify.update(calculatedHash);
    verify.end();

    const isSignatureValid = verify.verify(publicKey, signatureBase64, 'base64');

    if (!isSignatureValid) {
      return {
        valid: false,
        reason: 'INVALID_SIGNATURE',
        message: 'Tanda tangan digital tidak valid untuk kunci publik penerbit.'
      };
    }

    return {
      valid: true,
      hash: calculatedHash,
      message: 'Dokumen terverifikasi Asli & Sah (Integritas Kriptografi Terpenuhi).'
    };
  } catch (err) {
    return {
      valid: false,
      reason: 'VERIFICATION_ERROR',
      message: err.message
    };
  }
}

// Dynamic TOTP-like Token Generator (10-second rotating window)
function generateDynamicToken(sessionSecret, timestamp = Date.now()) {
  const timeStep = 10; // 10 seconds
  const currentStep = Math.floor(timestamp / 1000 / timeStep);
  const hmac = crypto.createHmac('sha256', sessionSecret);
  hmac.update(`UNAND-WS-TOKEN-${currentStep}`);
  const hex = hmac.digest('hex');
  // 6 uppercase alphanumeric code + full hex for QR
  const code = hex.substring(0, 6).toUpperCase();
  const fullToken = `UNAND-${code}-${currentStep}`;
  const secondsRemaining = timeStep - (Math.floor(timestamp / 1000) % timeStep);

  return {
    token: fullToken,
    shortCode: code,
    step: currentStep,
    secondsRemaining,
    timeStep
  };
}

// Validate Dynamic Token (Allows current step and immediate previous step for grace period)
function validateDynamicToken(sessionSecret, clientToken, timestamp = Date.now()) {
  if (!clientToken || typeof clientToken !== 'string') return false;
  const timeStep = 10;
  const currentStep = Math.floor(timestamp / 1000 / timeStep);
  const stepsToCheck = [currentStep, currentStep - 1]; // allow 10s grace window

  for (const step of stepsToCheck) {
    const hmac = crypto.createHmac('sha256', sessionSecret);
    hmac.update(`UNAND-WS-TOKEN-${step}`);
    const hex = hmac.digest('hex');
    const code = hex.substring(0, 6).toUpperCase();
    const expectedToken = `UNAND-${code}-${step}`;

    if (clientToken.trim().toUpperCase() === expectedToken || clientToken.trim().toUpperCase() === code) {
      return { valid: true, stepMatched: step };
    }
  }

  return { valid: false };
}

// Haversine formula for distance between 2 GPS coordinates in meters
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceMeters = R * c;
  return Math.round(distanceMeters * 10) / 10; // 1 decimal precision
}

module.exports = {
  initCryptoKeys,
  getPublicKeyPem,
  buildCanonicalCertPayload,
  computePayloadHash,
  signPayload,
  verifySignature,
  generateDynamicToken,
  validateDynamicToken,
  calculateHaversineDistance
};
