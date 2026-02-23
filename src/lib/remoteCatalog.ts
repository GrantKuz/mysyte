import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { REMOTE_CATALOG_ENABLED, SUPABASE_ANON_KEY, SUPABASE_BUCKET, SUPABASE_URL, SUPABASE_WORKS_TABLE } from '../config/publish';
import { type Work, type WorkImage } from '../types';

const REMOTE_WORKS_UPDATED_EVENT = 'gk-remote-works-updated';

interface RemoteWorkRow {
  id: string;
  title: string;
  title_ru: string | null;
  project: string;
  project_ru: string | null;
  polygons: string;
  description: string;
  description_ru: string | null;
  thumbnail: string;
  render_url: string;
  wireframe_url: string;
  images: WorkImage[] | null;
  model_url: string | null;
  type: 'prop' | 'cinematic';
  video_url: string | null;
}

interface RemoteImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  watermarkText?: string;
  forceMimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

let supabaseClient: SupabaseClient | null = null;

function getClient() {
  if (!REMOTE_CATALOG_ENABLED) {
    throw new Error('Remote catalog is not configured.');
  }

  if (supabaseClient) return supabaseClient;
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNullableString(value: string | undefined): string | null {
  return value?.trim() ? value.trim() : null;
}

function toRow(work: Work): RemoteWorkRow {
  return {
    id: work.id,
    title: work.title,
    title_ru: toNullableString(work.titleRu),
    project: work.project,
    project_ru: toNullableString(work.projectRu),
    polygons: work.polygons,
    description: work.description,
    description_ru: toNullableString(work.descriptionRu),
    thumbnail: work.thumbnail,
    render_url: work.renderUrl,
    wireframe_url: work.wireframeUrl,
    images: work.images ?? null,
    model_url: toNullableString(work.modelUrl),
    type: work.type,
    video_url: toNullableString(work.videoUrl)
  };
}

function normalizeWork(raw: unknown): Work | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== 'string') return null;
  if (typeof raw.title !== 'string') return null;
  if (typeof raw.project !== 'string') return null;
  if (typeof raw.polygons !== 'string') return null;
  if (typeof raw.description !== 'string') return null;
  if (typeof raw.thumbnail !== 'string') return null;
  if (typeof raw.render_url !== 'string') return null;
  if (typeof raw.wireframe_url !== 'string') return null;
  if (raw.type !== 'prop' && raw.type !== 'cinematic') return null;

  return {
    id: raw.id,
    title: raw.title,
    titleRu: typeof raw.title_ru === 'string' ? raw.title_ru : undefined,
    project: raw.project,
    projectRu: typeof raw.project_ru === 'string' ? raw.project_ru : undefined,
    polygons: raw.polygons,
    description: raw.description,
    descriptionRu: typeof raw.description_ru === 'string' ? raw.description_ru : undefined,
    thumbnail: raw.thumbnail,
    renderUrl: raw.render_url,
    wireframeUrl: raw.wireframe_url,
    images: Array.isArray(raw.images)
      ? raw.images
          .filter((image) => isObject(image) && typeof image.renderUrl === 'string')
          .map((image) => ({
            renderUrl: image.renderUrl as string,
            wireframeUrl: typeof image.wireframeUrl === 'string' ? image.wireframeUrl : undefined
          }))
      : undefined,
    modelUrl: typeof raw.model_url === 'string' ? raw.model_url : undefined,
    type: raw.type,
    videoUrl: typeof raw.video_url === 'string' ? raw.video_url : undefined
  };
}

function getFileExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 6) return fromName;

  const fromType = file.type.split('/').pop()?.toLowerCase();
  if (fromType && fromType.length <= 6) return fromType;

  return 'bin';
}

function randomPath(folder: string, file: File) {
  const random = Math.random().toString(36).slice(2, 10);
  const extension = getFileExtension(file);
  return `${folder}/${Date.now()}-${random}.${extension}`;
}

function randomPathByExtension(folder: string, extension: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${folder}/${Date.now()}-${random}.${extension}`;
}

async function optimizeImageBlob(file: File, options: RemoteImageOptions): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    watermarkText = '',
    forceMimeType = 'image/webp'
  } = options;

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
    canvas.toBlob((blob) => resolve(blob || file), forceMimeType, quality);
  });
}

function publicUrlToPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

function collectRemotePaths(work: Work): string[] {
  const urls = new Set<string>();
  const add = (url: string | undefined) => {
    if (typeof url === 'string' && url.trim()) urls.add(url);
  };

  add(work.thumbnail);
  add(work.renderUrl);
  add(work.wireframeUrl);
  add(work.modelUrl);
  add(work.videoUrl);
  work.images?.forEach((image) => {
    add(image.renderUrl);
    add(image.wireframeUrl);
  });

  return [...urls]
    .map(publicUrlToPath)
    .filter((path): path is string => Boolean(path));
}

export function isRemoteCatalogEnabled() {
  return REMOTE_CATALOG_ENABLED;
}

export function emitRemoteWorksUpdated() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(REMOTE_WORKS_UPDATED_EVENT));
}

export function onRemoteWorksUpdated(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const listener = () => callback();
  window.addEventListener(REMOTE_WORKS_UPDATED_EVENT, listener as EventListener);
  return () => {
    window.removeEventListener(REMOTE_WORKS_UPDATED_EVENT, listener as EventListener);
  };
}

export async function loadRemoteWorks(): Promise<Work[]> {
  if (!REMOTE_CATALOG_ENABLED) return [];

  const client = getClient();
  const { data, error } = await client
    .from(SUPABASE_WORKS_TABLE)
    .select('*');

  if (error) {
    throw new Error(`Failed to load remote works: ${error.message}`);
  }

  if (!Array.isArray(data)) return [];
  return data
    .map(normalizeWork)
    .filter((work): work is Work => Boolean(work))
    .sort((a, b) => b.id.localeCompare(a.id));
}

export async function addRemoteWork(work: Work): Promise<void> {
  if (!REMOTE_CATALOG_ENABLED) {
    throw new Error('Remote catalog is not configured.');
  }

  const client = getClient();
  const { error } = await client.from(SUPABASE_WORKS_TABLE).upsert(toRow(work), { onConflict: 'id' });
  if (error) {
    throw new Error(`Failed to publish work: ${error.message}`);
  }

  emitRemoteWorksUpdated();
}

export async function deleteRemoteWork(work: Work): Promise<void> {
  if (!REMOTE_CATALOG_ENABLED) return;

  const client = getClient();
  const paths = collectRemotePaths(work);

  if (paths.length > 0) {
    const { error: storageError } = await client.storage.from(SUPABASE_BUCKET).remove(paths);
    if (storageError) {
      throw new Error(`Failed to delete remote assets: ${storageError.message}`);
    }
  }

  const { error } = await client.from(SUPABASE_WORKS_TABLE).delete().eq('id', work.id);
  if (error) {
    throw new Error(`Failed to delete remote work: ${error.message}`);
  }

  emitRemoteWorksUpdated();
}

export async function uploadRemoteAsset(
  file: File,
  folder: 'thumbnails' | 'renders' | 'wireframes' | 'models' | 'videos',
  imageOptions?: RemoteImageOptions
): Promise<string> {
  if (!REMOTE_CATALOG_ENABLED) {
    throw new Error('Remote catalog is not configured.');
  }

  const preparedBlob =
    file.type.startsWith('image/') && imageOptions
      ? await optimizeImageBlob(file, imageOptions)
      : file;

  const extension =
    preparedBlob.type.split('/').pop()?.toLowerCase() ||
    getFileExtension(file);
  const path = randomPathByExtension(folder, extension);
  const client = getClient();

  const { error } = await client.storage.from(SUPABASE_BUCKET).upload(path, preparedBlob, {
    cacheControl: '31536000',
    upsert: false,
    contentType: preparedBlob.type || file.type || 'application/octet-stream'
  });

  if (error) {
    throw new Error(`Failed to upload asset: ${error.message}`);
  }

  const { data } = client.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
