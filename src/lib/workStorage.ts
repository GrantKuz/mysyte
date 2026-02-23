import { Work } from '../types';

const WORKS_STORAGE_KEY = 'gk.customWorks.v1';
const WORKS_UPDATED_EVENT = 'gk-works-updated';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeWork(rawWork: unknown): Work | null {
  if (!isObject(rawWork)) return null;
  if (typeof rawWork.id !== 'string') return null;
  if (typeof rawWork.title !== 'string') return null;
  if (typeof rawWork.project !== 'string') return null;
  if (typeof rawWork.polygons !== 'string') return null;
  if (typeof rawWork.description !== 'string') return null;
  if (typeof rawWork.thumbnail !== 'string') return null;
  if (typeof rawWork.renderUrl !== 'string') return null;
  if (typeof rawWork.wireframeUrl !== 'string') return null;
  if (rawWork.type !== 'prop' && rawWork.type !== 'cinematic') return null;

  return {
    id: rawWork.id,
    title: rawWork.title,
    titleRu: typeof rawWork.titleRu === 'string' ? rawWork.titleRu : undefined,
    project: rawWork.project,
    projectRu: typeof rawWork.projectRu === 'string' ? rawWork.projectRu : undefined,
    polygons: rawWork.polygons,
    description: rawWork.description,
    descriptionRu: typeof rawWork.descriptionRu === 'string' ? rawWork.descriptionRu : undefined,
    thumbnail: rawWork.thumbnail,
    renderUrl: rawWork.renderUrl,
    wireframeUrl: rawWork.wireframeUrl,
    images: Array.isArray(rawWork.images)
      ? rawWork.images
          .filter((image) => isObject(image) && typeof image.renderUrl === 'string')
          .map((image) => ({
            renderUrl: image.renderUrl as string,
            wireframeUrl: typeof image.wireframeUrl === 'string' ? image.wireframeUrl : undefined
          }))
      : undefined,
    modelUrl: typeof rawWork.modelUrl === 'string' ? rawWork.modelUrl : undefined,
    type: rawWork.type,
    videoUrl: typeof rawWork.videoUrl === 'string' ? rawWork.videoUrl : undefined
  };
}

function readStoredWorks(): Work[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(WORKS_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeWork).filter((work): work is Work => Boolean(work));
  } catch {
    return [];
  }
}

function writeStoredWorks(works: Work[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(WORKS_STORAGE_KEY, JSON.stringify(works));
  window.dispatchEvent(new CustomEvent(WORKS_UPDATED_EVENT));
}

export function loadCustomWorks(): Work[] {
  return readStoredWorks();
}

export function addCustomWork(work: Work) {
  const existing = readStoredWorks();
  const next = [work, ...existing.filter((item) => item.id !== work.id)];
  writeStoredWorks(next);
}

export function removeCustomWork(workId: string) {
  const existing = readStoredWorks();
  writeStoredWorks(existing.filter((item) => item.id !== workId));
}

export function onCustomWorksUpdated(callback: () => void): () => void {
  const listener = () => callback();
  window.addEventListener('storage', listener);
  window.addEventListener(WORKS_UPDATED_EVENT, listener as EventListener);

  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(WORKS_UPDATED_EVENT, listener as EventListener);
  };
}
