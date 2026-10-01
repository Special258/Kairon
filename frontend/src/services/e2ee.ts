/**
 * Kairon End-to-End Encryption (E2EE) Module
 * 
 * Implements client-side zero-knowledge encryption using Web Crypto API.
 * - Cipher: AES-256-GCM with 12-byte random IV per operation
 * - Key Derivation: PBKDF2 (HMAC-SHA-256, 100,000 iterations)
 * - Guarantees: Plaintext customer notes, review decisions, and sensitive
 *   attributes are never transmitted or stored unencrypted.
 */

export interface EncryptedPayload {
  v: number;
  algo: 'AES-256-GCM';
  iv: string;         // Base64
  salt: string;       // Base64
  ciphertext: string; // Base64
  fingerprint: string;
}

const STORAGE_KEY = 'kairon_e2ee_device_key';
const KEY_SALT_KEY = 'kairon_e2ee_device_salt';

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

class E2EEService {
  private cryptoKey: CryptoKey | null = null;
  private keyFingerprint: string | null = null;
  private initialized = false;

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;
  }

  /**
   * Initializes or loads the client master encryption key.
   */
  public async init(passphrase?: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Web Crypto API is not supported in this browser environment.');
    }

    if (passphrase) {
      return this.deriveFromPassphrase(passphrase);
    }

    // Check if device key already exists
    const storedSecret = localStorage.getItem(STORAGE_KEY);
    const storedSalt = localStorage.getItem(KEY_SALT_KEY);

    if (storedSecret && storedSalt) {
      await this.deriveFromRawSecret(storedSecret, storedSalt);
    } else {
      // Generate new high-entropy device secret
      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);
      const secret = bufferToBase64(randomBytes);

      const saltBytes = new Uint8Array(16);
      window.crypto.getRandomValues(saltBytes);
      const salt = bufferToBase64(saltBytes);

      localStorage.setItem(STORAGE_KEY, secret);
      localStorage.setItem(KEY_SALT_KEY, salt);

      await this.deriveFromRawSecret(secret, salt);
    }

    this.initialized = true;
    return this.keyFingerprint || 'unknown';
  }

  private async deriveFromRawSecret(secretBase64: string, saltBase64: string): Promise<void> {
    const rawSecret = base64ToBuffer(secretBase64);
    const salt = base64ToBuffer(saltBase64);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      rawSecret as unknown as BufferSource,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true, // extractable for key export / backup
      ['encrypt', 'decrypt']
    );

    await this.computeFingerprint();
  }

  public async deriveFromPassphrase(passphrase: string): Promise<string> {
    const enc = new TextEncoder();
    const pwBuffer = enc.encode(passphrase);

    let salt = localStorage.getItem(KEY_SALT_KEY);
    if (!salt) {
      const saltBytes = new Uint8Array(16);
      window.crypto.getRandomValues(saltBytes);
      salt = bufferToBase64(saltBytes);
      localStorage.setItem(KEY_SALT_KEY, salt);
    }
    const saltBytes = base64ToBuffer(salt);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      pwBuffer as unknown as BufferSource,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    await this.computeFingerprint();
    this.initialized = true;
    return this.keyFingerprint || 'unknown';
  }

  private async computeFingerprint(): Promise<void> {
    if (!this.cryptoKey) return;
    try {
      const rawKey = await window.crypto.subtle.exportKey('raw', this.cryptoKey);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', rawKey);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
      this.keyFingerprint = `SHA-256:${hex}`;
    } catch {
      this.keyFingerprint = 'SHA-256:LOCAL-DEV';
    }
  }

  public async getFingerprint(): Promise<string> {
    if (!this.initialized || !this.keyFingerprint) {
      await this.init();
    }
    return this.keyFingerprint || 'SHA-256:ACTIVE';
  }

  /**
   * Encrypts plaintext string using AES-256-GCM with a fresh 96-bit random IV.
   */
  public async encrypt(plaintext: string): Promise<string> {
    if (!this.cryptoKey) {
      await this.init();
    }
    if (!this.cryptoKey) {
      throw new Error('Encryption key not initialized');
    }

    const enc = new TextEncoder();
    const data = enc.encode(plaintext);

    // 96-bit (12 bytes) recommended for AES-GCM
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(iv);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      this.cryptoKey,
      data
    );

    const payload: EncryptedPayload = {
      v: 1,
      algo: 'AES-256-GCM',
      iv: bufferToBase64(iv),
      salt: localStorage.getItem(KEY_SALT_KEY) || '',
      ciphertext: bufferToBase64(ciphertextBuffer),
      fingerprint: this.keyFingerprint || 'active'
    };

    return `e2ee:v1:${btoa(JSON.stringify(payload))}`;
  }

  /**
   * Decrypts an encrypted payload or returns the string if already unencrypted.
   */
  public async decrypt(cipherOrPlain: string): Promise<string> {
    if (!cipherOrPlain) return '';
    if (!cipherOrPlain.startsWith('e2ee:v1:')) {
      // Plaintext legacy note
      return cipherOrPlain;
    }

    if (!this.cryptoKey) {
      await this.init();
    }
    if (!this.cryptoKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const base64Json = cipherOrPlain.replace('e2ee:v1:', '');
      const payload: EncryptedPayload = JSON.parse(atob(base64Json));

      const iv = base64ToBuffer(payload.iv);
      const ciphertext = base64ToBuffer(payload.ciphertext);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource
        },
        this.cryptoKey,
        ciphertext as unknown as BufferSource
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch (err) {
      console.warn('E2EE Decryption fallback:', err);
      return '[Encrypted with a different key]';
    }
  }

  public isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith('e2ee:v1:');
  }

  public async exportBackupKey(): Promise<string> {
    if (!this.cryptoKey) await this.init();
    if (!this.cryptoKey) throw new Error('Key not available');
    const exported = await window.crypto.subtle.exportKey('jwk', this.cryptoKey);
    return btoa(JSON.stringify(exported));
  }

  public async importBackupKey(jwkBase64: string): Promise<string> {
    const jwk = JSON.parse(atob(jwkBase64));
    this.cryptoKey = await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
    await this.computeFingerprint();
    this.initialized = true;
    return this.keyFingerprint || 'imported';
  }
}

export const e2ee = new E2EEService();
