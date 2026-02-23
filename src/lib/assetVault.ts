type ImportMetaWithEnv = ImportMeta & { env?: Record<string, string | undefined> };

const DB_NAME = 'gk-asset-vault';
const DB_VERSION = 1;
const STORE_NAME = 'assets';
const VAULT_REF_PREFIX = 'vault://';

const env = (import.meta as ImportMetaWithEnv).env ?? {};
const FALLBACK_SECRET = 'local-vault-obfuscation-key-change-me';
const VAULT_SECRET = (env.VITE_ASSET_OBFUSCATION_KEY || FALLBACK_SECRET).trim();

interface VaultRecord {
  id: string;
  payload: ArrayBuffer;
  iv: ArrayBuffer;
  mimeType: string;
  fileName: string;
  createdAt: number;
}

interface ImageOptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  watermarkText?: string;
  forceMimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

let keyPromise: Promise<CryptoKey> | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function getCryptoApi() {
  if (!isBrowser() || !window.crypto?.subtle) {
    throw new Error('WebCrypto is not available in this environment.');
  }
  return window.crypto;
}

function generateId() {
  const cryptoApi = getCryptoApi();
  if (typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openDb(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });

  return dbPromise;
}

function dbRequestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
  });
}

async function getKey(): Promise<CryptoKey> {
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    const cryptoApi = getCryptoApi();
    const secretBytes = new TextEncoder().encode(VAULT_SECRET);
    const digest = await cryptoApi.subtle.digest('SHA-256', secretBytes);
    return cryptoApi.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
  })();

  return keyPromise;
}

async function encryptBytes(data: ArrayBuffer): Promise<{ payload: ArrayBuffer; iv: ArrayBuffer }> {
  const cryptoApi = getCryptoApi();
  const key = await getKey();
  const iv = cryptoApi.getRandomValues(new Uint8Array(12));
  const payload = await cryptoApi.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return { payload, iv: iv.buffer };
}

async function decryptBytes(payload: ArrayBuffer, iv: ArrayBuffer): Promise<ArrayBuffer> {
  const key = await getKey();
  const cryptoApi = getCryptoApi();
  return cryptoApi.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, payload);
}

async function optimizeImageBlob(file: File, options: ImageOptimizeOptions): Promise<Blob> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.82, watermarkText = '', forceMimeType = 'image/webp' } = options;

  if (!isBrowser() || typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const targetWidth = Math.max(1, Math.round(bitmap.width * ratio));
  const targetHeight = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  if (watermarkText) {
    const fontSize = Math.max(12, Math.round(targetWidth * 0.025));
    context.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
    context.fillStyle = 'rgba(255,255,255,0.45)';
    context.textAlign = 'right';
    context.textBaseline = 'bottom';
    context.fillText(watermarkText, targetWidth - 14, targetHeight - 14);
  }

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      forceMimeType,
      quality
    );
  });
}

async function putRecord(record: VaultRecord) {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.put(record);
  await transactionDone(transaction);
}

async function getRecordById(id: string): Promise<VaultRecord | undefined> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(id);
  const result = await dbRequestToPromise<VaultRecord | undefined>(request);
  await transactionDone(transaction);
  return result;
}

async function deleteRecordById(id: string): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.delete(id);
  await transactionDone(transaction);
}

export function isVaultRef(value: string | undefined | null): value is string {
  return Boolean(value && value.startsWith(VAULT_REF_PREFIX));
}

export function toVaultRef(assetId: string) {
  return `${VAULT_REF_PREFIX}${assetId}`;
}

export function fromVaultRef(vaultRef: string | undefined | null): string | null {
  if (!isVaultRef(vaultRef)) return null;
  return vaultRef.slice(VAULT_REF_PREFIX.length) || null;
}

export async function saveAssetFromFile(
  file: File,
  imageOptions?: ImageOptimizeOptions
): Promise<string> {
  const preparedBlob =
    file.type.startsWith('image/') && imageOptions
      ? await optimizeImageBlob(file, imageOptions)
      : file;

  const bytes = await preparedBlob.arrayBuffer();
  const { payload, iv } = await encryptBytes(bytes);
  const assetId = generateId();

  await putRecord({
    id: assetId,
    payload,
    iv,
    mimeType: preparedBlob.type || file.type || 'application/octet-stream',
    fileName: file.name,
    createdAt: Date.now()
  });

  return toVaultRef(assetId);
}

export async function readAssetBlob(vaultRef: string): Promise<Blob | null> {
  const assetId = fromVaultRef(vaultRef);
  if (!assetId) return null;

  const record = await getRecordById(assetId);
  if (!record) return null;

  try {
    const bytes = await decryptBytes(record.payload, record.iv);
    return new Blob([bytes], { type: record.mimeType || 'application/octet-stream' });
  } catch {
    return null;
  }
}

export async function resolveAssetToUrl(source: string | undefined): Promise<string | undefined> {
  if (!source) return undefined;
  if (!isVaultRef(source)) return source;

  const blob = await readAssetBlob(source);
  if (!blob) return undefined;
  return URL.createObjectURL(blob);
}

export async function deleteAssetByRef(vaultRef: string | undefined): Promise<void> {
  const assetId = fromVaultRef(vaultRef);
  if (!assetId) return;
  await deleteRecordById(assetId);
}
