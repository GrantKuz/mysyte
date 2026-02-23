import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Lock, LogOut, Plus, ShieldAlert, Trash2, Upload } from 'lucide-react';
import { Work, GalleryTab } from '../types';
import { addCustomWork, loadCustomWorks, onCustomWorksUpdated, removeCustomWork } from '../lib/workStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { ADMIN_ENABLED } from '../config/admin';
import { deleteAssetByRef, isVaultRef, saveAssetFromFile } from '../lib/assetVault';
import {
  addRemoteWork,
  deleteRemoteWork,
  isRemoteCatalogEnabled,
  loadRemoteWorks,
  onRemoteWorksUpdated,
  uploadRemoteAsset
} from '../lib/remoteCatalog';

const ADMIN_SESSION_KEY = 'gk.admin.session';

type ImportMetaWithEnv = ImportMeta & { env?: Record<string, string | undefined> };
const DEFAULT_ADMIN_PASSWORD =
  ((import.meta as ImportMetaWithEnv).env?.VITE_ADMIN_PASSWORD || '').trim();

type WorkFormState = {
  title: string;
  titleRu: string;
  project: string;
  projectRu: string;
  polygons: string;
  description: string;
  descriptionRu: string;
  thumbnail: string;
  renderUrl: string;
  wireframeUrl: string;
  modelUrl: string;
  videoUrl: string;
  type: GalleryTab;
};

type UploadFilesState = {
  thumbnail: File | null;
  render: File | null;
  wireframe: File | null;
  model: File | null;
  video: File | null;
};

type PublishMode = 'local' | 'remote';

const initialFormState: WorkFormState = {
  title: '',
  titleRu: '',
  project: '',
  projectRu: '',
  polygons: '',
  description: '',
  descriptionRu: '',
  thumbnail: '',
  renderUrl: '',
  wireframeUrl: '',
  modelUrl: '',
  videoUrl: '',
  type: 'props'
};

const initialUploadState: UploadFilesState = {
  thumbnail: null,
  render: null,
  wireframe: null,
  model: null,
  video: null
};

function collectVaultRefs(work: Work): string[] {
  const refs = new Set<string>();

  const pushRef = (value: string | undefined) => {
    if (isVaultRef(value)) refs.add(value);
  };

  pushRef(work.thumbnail);
  pushRef(work.renderUrl);
  pushRef(work.wireframeUrl);
  pushRef(work.modelUrl);
  pushRef(work.videoUrl);

  if (work.images?.length) {
    for (const image of work.images) {
      pushRef(image.renderUrl);
      pushRef(image.wireframeUrl);
    }
  }

  return [...refs];
}

export default function Admin() {
  const { language } = useLanguage();
  const remoteEnabled = isRemoteCatalogEnabled();
  const [publishMode, setPublishMode] = useState<PublishMode>(remoteEnabled ? 'remote' : 'local');

  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'ok';
  });
  const [authError, setAuthError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<WorkFormState>(initialFormState);
  const [uploads, setUploads] = useState<UploadFilesState>(initialUploadState);
  const [works, setWorks] = useState<Work[]>(() => loadCustomWorks());

  const isPasswordConfigured = DEFAULT_ADMIN_PASSWORD.length >= 12;

  useEffect(() => {
    let disposed = false;

    if (publishMode === 'remote' && remoteEnabled) {
      const syncRemoteWorks = async () => {
        try {
          const remoteWorks = await loadRemoteWorks();
          if (!disposed) {
            setWorks(remoteWorks);
          }
        } catch {
          if (!disposed) {
            setWorks([]);
          }
        }
      };

      void syncRemoteWorks();
      const unsubscribe = onRemoteWorksUpdated(() => {
        void syncRemoteWorks();
      });

      return () => {
        disposed = true;
        unsubscribe();
      };
    }

    const syncLocalWorks = () => {
      if (!disposed) {
        setWorks(loadCustomWorks());
      }
    };

    syncLocalWorks();
    const unsubscribe = onCustomWorksUpdated(syncLocalWorks);

    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [publishMode, remoteEnabled]);

  const copy = useMemo(
    () =>
      language === 'ru'
        ? {
            title: 'Панель управления работами',
            subtitle: 'Добавляйте работы через сайт с загрузкой файлов.',
            securityNote:
              'Важно: без собственного backend абсолютной защиты не бывает. Для общего каталога используйте облачный режим.',
            localStorageNote:
              'Локальный режим: файлы сохраняются только в IndexedDB этого браузера, на других устройствах их не будет.',
            remoteStorageNote:
              'Облачный режим: работы публикуются в общем каталоге и видны всем посетителям сайта.',
            modeLabel: 'Режим публикации',
            modeLocal: 'Локально',
            modeRemote: 'Общий каталог',
            loginTitle: 'Вход',
            passwordPlaceholder: 'Пароль администратора',
            loginButton: 'Войти',
            loginError: 'Неверный пароль',
            notConfigured: 'Пароль администратора не задан в env',
            logout: 'Выйти',
            formTitle: 'Новая работа',
            submit: 'Добавить работу',
            saving: 'Сохранение...',
            customListLocal: 'Локальные работы',
            customListRemote: 'Опубликованные работы',
            empty: 'Пока нет добавленных работ',
            delete: 'Удалить',
            type: 'Тип',
            prop: 'Пропс',
            cinematic: 'Синематика',
            thumbRequired: 'Добавьте превью: URL или файл.',
            videoRequired: 'Для синематики добавьте видео: URL или файл.',
            fields: {
              title: 'Название (EN)',
              titleRu: 'Название (RU)',
              project: 'Проект (EN)',
              projectRu: 'Проект (RU)',
              polygons: 'Полигоны (например: 12,400)',
              description: 'Описание (EN)',
              descriptionRu: 'Описание (RU)',
              thumbnailUrl: 'URL превью (опционально, если загружаете файл)',
              renderUrl: 'URL рендера (опционально)',
              wireframeUrl: 'URL wireframe (опционально)',
              modelUrl: 'URL модели .glb (опционально)',
              videoUrl: 'URL видео (опционально)',
              thumbnailFile: 'Файл превью',
              renderFile: 'Файл рендера',
              wireframeFile: 'Файл wireframe',
              modelFile: 'Файл .glb',
              videoFile: 'Файл видео (mp4/webm/mov)'
            }
          }
        : {
            title: 'Work Admin Panel',
            subtitle: 'Add works through the website with direct file upload.',
            securityNote:
              'Important: without your own backend, protection is never absolute. Use cloud mode for shared catalog.',
            localStorageNote:
              'Local mode: assets are stored in this browser IndexedDB only and are not shared across devices.',
            remoteStorageNote:
              'Cloud mode: works are published to the shared catalog and visible to all website visitors.',
            modeLabel: 'Publish mode',
            modeLocal: 'Local only',
            modeRemote: 'Shared catalog',
            loginTitle: 'Sign in',
            passwordPlaceholder: 'Admin password',
            loginButton: 'Sign in',
            loginError: 'Invalid password',
            notConfigured: 'Admin password is not configured in env',
            logout: 'Logout',
            formTitle: 'New Work',
            submit: 'Add Work',
            saving: 'Saving...',
            customListLocal: 'Local Works',
            customListRemote: 'Published Works',
            empty: 'No works yet',
            delete: 'Delete',
            type: 'Type',
            prop: 'Prop',
            cinematic: 'Cinematic',
            thumbRequired: 'Please provide thumbnail URL or file.',
            videoRequired: 'For cinematic, provide video URL or video file.',
            fields: {
              title: 'Title (EN)',
              titleRu: 'Title (RU)',
              project: 'Project (EN)',
              projectRu: 'Project (RU)',
              polygons: 'Polygons (example: 12,400)',
              description: 'Description (EN)',
              descriptionRu: 'Description (RU)',
              thumbnailUrl: 'Thumbnail URL (optional when uploading file)',
              renderUrl: 'Render URL (optional)',
              wireframeUrl: 'Wireframe URL (optional)',
              modelUrl: '3D model .glb URL (optional)',
              videoUrl: 'Video URL (optional)',
              thumbnailFile: 'Thumbnail file',
              renderFile: 'Render file',
              wireframeFile: 'Wireframe file',
              modelFile: 'Model .glb file',
              videoFile: 'Video file (mp4/webm/mov)'
            }
          },
    [language]
  );

  const setUploadFile = (key: keyof UploadFilesState, fileList: FileList | null) => {
    setUploads((prev) => ({ ...prev, [key]: fileList && fileList[0] ? fileList[0] : null }));
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isPasswordConfigured) {
      setAuthError(copy.notConfigured);
      return;
    }

    if (password === DEFAULT_ADMIN_PASSWORD) {
      setIsUnlocked(true);
      setAuthError('');
      window.localStorage.setItem(ADMIN_SESSION_KEY, 'ok');
      return;
    }

    setAuthError(copy.loginError);
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    setPassword('');
    setAuthError('');
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const resolveImageSource = async (
    file: File | null,
    fallbackUrl: string,
    options: { maxWidth: number; maxHeight: number; quality: number },
    folder: 'thumbnails' | 'renders' | 'wireframes'
  ): Promise<string> => {
    if (file) {
      if (publishMode === 'remote' && remoteEnabled) {
        return uploadRemoteAsset(file, folder, {
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight,
          quality: options.quality,
          watermarkText: 'GK.ART',
          forceMimeType: 'image/webp'
        });
      }

      return saveAssetFromFile(file, {
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        quality: options.quality,
        watermarkText: 'GK.ART',
        forceMimeType: 'image/webp'
      });
    }

    return fallbackUrl.trim();
  };

  const resolveRawSource = async (
    file: File | null,
    fallbackUrl: string,
    folder: 'models' | 'videos'
  ): Promise<string> => {
    if (file) {
      if (publishMode === 'remote' && remoteEnabled) {
        return uploadRemoteAsset(file, folder);
      }
      return saveAssetFromFile(file);
    }
    return fallbackUrl.trim();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');
    setIsSaving(true);

    try {
      const isCinematic = form.type === 'cinematics';
      const thumbnail = await resolveImageSource(
        uploads.thumbnail,
        form.thumbnail,
        { maxWidth: 1200, maxHeight: 1200, quality: 0.76 },
        'thumbnails'
      );

      if (!thumbnail) {
        setSubmitError(copy.thumbRequired);
        setIsSaving(false);
        return;
      }

      if (isCinematic && !uploads.video && !form.videoUrl.trim()) {
        setSubmitError(copy.videoRequired);
        setIsSaving(false);
        return;
      }

      const renderUrl =
        (await resolveImageSource(
          uploads.render,
          form.renderUrl,
          { maxWidth: 1920, maxHeight: 1920, quality: 0.82 },
          'renders'
        )) || thumbnail;

      const wireframeUrl = isCinematic
        ? ''
        : await resolveImageSource(
            uploads.wireframe,
            form.wireframeUrl,
            { maxWidth: 1920, maxHeight: 1920, quality: 0.9 },
            'wireframes'
          );

      const modelUrl = isCinematic ? '' : await resolveRawSource(uploads.model, form.modelUrl, 'models');
      const videoUrl = isCinematic ? await resolveRawSource(uploads.video, form.videoUrl, 'videos') : '';
      const polygons = form.polygons.trim() || (isCinematic ? 'N/A' : '0');

      const newWork: Work = {
        id: `${publishMode}-${Date.now()}`,
        title: form.title.trim(),
        titleRu: form.titleRu.trim() || undefined,
        project: form.project.trim(),
        projectRu: form.projectRu.trim() || undefined,
        polygons,
        description: form.description.trim(),
        descriptionRu: form.descriptionRu.trim() || undefined,
        thumbnail,
        renderUrl,
        wireframeUrl,
        modelUrl: modelUrl || undefined,
        videoUrl: videoUrl || undefined,
        type: isCinematic ? 'cinematic' : 'prop'
      };

      if (publishMode === 'remote' && remoteEnabled) {
        await addRemoteWork(newWork);
        setWorks(await loadRemoteWorks());
      } else {
        addCustomWork(newWork);
        setWorks(loadCustomWorks());
      }

      setForm(initialFormState);
      setUploads(initialUploadState);
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : 'Failed to save work.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (workId: string) => {
    const targetWork = works.find((work) => work.id === workId);
    if (!targetWork) return;

    try {
      if (publishMode === 'remote' && remoteEnabled) {
        await deleteRemoteWork(targetWork);
        setWorks(await loadRemoteWorks());
        return;
      }

      const refs = collectVaultRefs(targetWork);
      await Promise.all(refs.map((ref) => deleteAssetByRef(ref)));
      removeCustomWork(workId);
      setWorks(loadCustomWorks());
    } catch (caughtError) {
      setSubmitError(caughtError instanceof Error ? caughtError.message : 'Failed to delete work.');
    }
  };

  if (!ADMIN_ENABLED) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200">
          <p className="font-semibold">
            {language === 'ru'
              ? 'Админ-панель отключена. Включите VITE_ENABLE_ADMIN=true в локальном окружении.'
              : 'Admin panel is disabled. Enable VITE_ENABLE_ADMIN=true in local environment.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <header className="mb-8 sm:mb-10 rounded-3xl p-6 sm:p-8 border border-emerald-200/50 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-cyan-50/60 dark:from-[#142522]/80 dark:via-[#112a2a]/70 dark:to-[#102333]/60 backdrop-blur-xl">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">{copy.title}</h1>
        <p className="text-neutral-600 dark:text-neutral-300 mt-2">{copy.subtitle}</p>

        <div className="mt-4 flex items-start gap-2 text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <span>{copy.securityNote}</span>
        </div>

        {remoteEnabled && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              {copy.modeLabel}
            </p>
            <div className="inline-flex p-1 rounded-xl bg-white/70 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setPublishMode('local')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-colors ${
                  publishMode === 'local'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {copy.modeLocal}
              </button>
              <button
                type="button"
                onClick={() => setPublishMode('remote')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-semibold transition-colors ${
                  publishMode === 'remote'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {copy.modeRemote}
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 bg-white/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3">
          {publishMode === 'remote' && remoteEnabled ? copy.remoteStorageNote : copy.localStorageNote}
        </div>
      </header>

      {!isUnlocked ? (
        <form
          onSubmit={handleLogin}
          className="max-w-md rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl shadow-xl"
        >
          <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">{copy.loginTitle}</h2>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.passwordPlaceholder}
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              required
            />
          </div>
          {authError && <p className="mt-3 text-sm text-rose-500">{authError}</p>}
          <button
            type="submit"
            className="mt-5 w-full py-3 rounded-xl font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          >
            {copy.loginButton}
          </button>
        </form>
      ) : (
        <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{copy.formTitle}</h2>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <LogOut size={14} />
                {copy.logout}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder={copy.fields.title}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  required
                />
                <input
                  value={form.titleRu}
                  onChange={(event) => setForm((prev) => ({ ...prev, titleRu: event.target.value }))}
                  placeholder={copy.fields.titleRu}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.project}
                  onChange={(event) => setForm((prev) => ({ ...prev, project: event.target.value }))}
                  placeholder={copy.fields.project}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  required
                />
                <input
                  value={form.projectRu}
                  onChange={(event) => setForm((prev) => ({ ...prev, projectRu: event.target.value }))}
                  placeholder={copy.fields.projectRu}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>

              <input
                value={form.polygons}
                onChange={(event) => setForm((prev) => ({ ...prev, polygons: event.target.value }))}
                placeholder={copy.fields.polygons}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />

              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder={copy.fields.description}
                className="w-full px-3 py-2.5 min-h-[90px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                required
              />
              <textarea
                value={form.descriptionRu}
                onChange={(event) => setForm((prev) => ({ ...prev, descriptionRu: event.target.value }))}
                placeholder={copy.fields.descriptionRu}
                className="w-full px-3 py-2.5 min-h-[90px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.thumbnail}
                  onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                  placeholder={copy.fields.thumbnailUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
                <label className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setUploadFile('thumbnail', event.target.files)}
                  />
                  {uploads.thumbnail ? uploads.thumbnail.name : copy.fields.thumbnailFile}
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.renderUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, renderUrl: event.target.value }))}
                  placeholder={copy.fields.renderUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
                <label className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setUploadFile('render', event.target.files)}
                  />
                  {uploads.render ? uploads.render.name : copy.fields.renderFile}
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.wireframeUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, wireframeUrl: event.target.value }))}
                  placeholder={copy.fields.wireframeUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
                <label className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setUploadFile('wireframe', event.target.files)}
                  />
                  {uploads.wireframe ? uploads.wireframe.name : copy.fields.wireframeFile}
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.modelUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, modelUrl: event.target.value }))}
                  placeholder={copy.fields.modelUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
                <label className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="file"
                    accept=".glb,model/gltf-binary"
                    className="hidden"
                    onChange={(event) => setUploadFile('model', event.target.files)}
                  />
                  {uploads.model ? uploads.model.name : copy.fields.modelFile}
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, type: event.target.value as GalleryTab }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  <option value="props">{copy.type}: {copy.prop}</option>
                  <option value="cinematics">{copy.type}: {copy.cinematic}</option>
                </select>
                <input
                  value={form.videoUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                  placeholder={copy.fields.videoUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>

              <label className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-600 dark:text-neutral-300 cursor-pointer block">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="hidden"
                  onChange={(event) => setUploadFile('video', event.target.files)}
                />
                {uploads.video ? uploads.video.name : copy.fields.videoFile}
              </label>

              {submitError && <p className="text-sm text-rose-500">{submitError}</p>}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-3 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Upload size={16} className="animate-pulse" /> : <Plus size={16} />}
                {isSaving ? copy.saving : copy.submit}
              </button>
            </form>
          </div>

          <aside className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">
              {publishMode === 'remote' && remoteEnabled ? copy.customListRemote : copy.customListLocal}
            </h2>
            <div className="space-y-3">
              {works.length === 0 && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.empty}</p>
              )}
              {works.map((work) => {
                const workTitle = language === 'ru' ? work.titleRu ?? work.title : work.title;
                const workProject = language === 'ru' ? work.projectRu ?? work.project : work.project;

                return (
                  <div
                    key={work.id}
                    className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70"
                  >
                    <p className="font-bold text-sm text-neutral-900 dark:text-white">{workTitle}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{workProject}</p>
                    <button
                      type="button"
                      onClick={() => void handleDelete(work.id)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                      {copy.delete}
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
