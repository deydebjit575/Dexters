import { EmergencyToken } from '../types/medical';

/**
 * MediVault Zero-Knowledge Cryptographic Service using Web Crypto API (AES-256-GCM)
 */

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a 256-bit AES-GCM CryptoKey
 */
export async function generateAESKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export CryptoKey to Base64URL string for shareable token URL
 */
export async function exportKeyToString(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return bufferToBase64(exported);
}

/**
 * Import CryptoKey from Base64URL string
 */
export async function importKeyFromString(keyStr: string): Promise<CryptoKey> {
  const buffer = base64ToBuffer(keyStr);
  return await window.crypto.subtle.importKey(
    'raw',
    buffer,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary JavaScript payload object with AES-GCM
 */
export async function encryptPayload<T>(
  data: T,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder();
  const jsonStr = JSON.stringify(data);
  const dataBuffer = encoder.encode(jsonStr);

  // Generate random 12-byte IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataBuffer
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer),
  };
}

/**
 * Decrypt AES-GCM ciphertext using CryptoKey and IV
 */
export async function decryptPayload<T>(
  ciphertext: string,
  ivBase64: string,
  key: CryptoKey
): Promise<T> {
  const encryptedBuffer = base64ToBuffer(ciphertext);
  const ivBuffer = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer),
    },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  const jsonStr = decoder.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as T;
}

/**
 * Create a full Emergency Token object with expiration time
 */
export async function createEmergencyToken(
  patientId: string,
  permittedRecordIds: string[],
  payloadData: any,
  durationMinutes: number
): Promise<EmergencyToken> {
  const key = await generateAESKey();
  const secretKeyStr = await exportKeyToString(key);
  const { ciphertext, iv } = await encryptPayload(payloadData, key);

  const now = Date.now();
  const expiresAt = now + durationMinutes * 60 * 1000;
  
  // Random token identifier
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(8));
  const tokenString = 'MV-' + bufferToBase64(randomBytes.buffer).substring(0, 10).toUpperCase();

  return {
    token: tokenString,
    secretKey: secretKeyStr,
    createdAt: now,
    expiresAt,
    durationMinutes,
    patientId,
    permittedRecordIds,
    payload: ciphertext,
    iv,
    isRevoked: false,
  };
}

/**
 * Build shareable URL hash for emergency doctor access
 */
export function buildEmergencyAccessUrl(token: EmergencyToken): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  params.set('view', 'doctor');
  params.set('token', token.token);
  params.set('key', token.secretKey);
  return `${baseUrl}#${params.toString()}`;
}
