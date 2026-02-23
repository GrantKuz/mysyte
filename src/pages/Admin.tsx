import { FormEvent, useEffect, useMemo, useState } from 'react';
import { LogOut, Trash2, Upload, AlertCircle } from 'lucide-react';
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
            title: 'Управление',
            subtitle: 'Добавляйте и редактируйте проекты в портфолио.',
            securityNote: 'Внимание: Без собственного Backend защиты нет. Используйте облачный режим.',
            localStorageNote: 'Файлы сохраняются только локально в этом браузере.',
            remoteStorageNote: 'Работы публикуются в общий облачный каталог.',
            modeLabel: 'Режим',
            modeLocal: 'Локально',
            modeRemote: 'Облако',
            loginTitle: 'Доступ',
            passwordPlaceholder: 'Пароль администратора',
            loginButton: 'Войти',
            loginError: 'Неверный пароль',
            notConfigured: 'Пароль администратора не задан',
            logout: 'Выйти',
            formTitle: 'Новый проект',
            submit: 'Опубликовать',
            saving: 'Сохранение...',
            customListLocal: 'Локальные проекты',
            customListRemote: 'Опубликованные проекты',
            empty: 'Проектов пока нет',
            delete: 'Удалить',
            type: 'Тип',
            prop: 'Пропс',
            cinematic: 'Синематика',
            thumbRequired: 'Требуется превью: URL или файл.',
            videoRequired: 'Для синематики требуется видео: URL или файл.',
            fields: {
              title: 'Название (EN)',
              titleRu: 'Название (RU)',
              project: 'Проект (EN)',
              projectRu: 'Проект (RU)',
              polygons: 'Полигоны (напр. 12,400)',
              description: 'Описание (EN)',
              descriptionRu: 'Описание (RU)',
              thumbnailUrl: 'URL превью',
              renderUrl: 'URL рендера',
              wireframeUrl: 'URL сетки',
              modelUrl: 'URL 3D-модели (.glb)',
              videoUrl: 'URL видео',
              thumbnailFile: 'Загрузить превью',
              renderFile: 'Загрузить рендер',
              wireframeFile: 'Загрузить сетку',
              modelFile: 'Загрузить .glb',
              videoFile: 'Загрузить видео'
            }
          }
        : {
            title: 'Control Panel',
            subtitle: 'Add and manage portfolio projects.',
            securityNote: 'Warning: Absolute security requires a custom backend. Use cloud mode.',
            localStorageNote: 'Assets are stored locally in this browser only.',
            remoteStorageNote: 'Works are published to the public cloud catalog.',
            modeLabel: 'Mode',
            modeLocal: 'Local',
            modeRemote: 'Cloud',
            loginTitle: 'Access',
            passwordPlaceholder: 'Admin Password',
            loginButton: 'Sign In',
            loginError: 'Invalid password',
            notConfigured: 'Admin password not configured',
            logout: 'Sign Out',
            formTitle: 'New Project',
            submit: 'Publish',
            saving: 'Saving...',
            customListLocal: 'Local Projects',
            customListRemote: 'Published Projects',
            empty: 'No projects yet',
            delete: 'Delete',
            type: 'Type',
            prop: 'Prop',
            cinematic: 'Cinematic',
            thumbRequired: 'Thumbnail URL or file is required.',
            videoRequired: 'Video URL or file is required for cinematics.',
            fields: {
              title: 'Title (EN)',
              titleRu: 'Title (RU)',
              project: 'Project (EN)',
              projectRu: 'Project (RU)',
              polygons: 'Polygons (e.g. 12,400)',
              description: 'Description (EN)',
              descriptionRu: 'Description (RU)',
              thumbnailUrl: 'Thumbnail URL',
              renderUrl: 'Render URL',
              wireframeUrl: 'Wireframe URL',
              modelUrl: '3D Model URL (.glb)',
              videoUrl: 'Video URL',
              thumbnailFile: 'Upload Thumbnail',
              renderFile: 'Upload Render',
              wireframeFile: 'Upload Wireframe',
              modelFile: 'Upload .glb',
              videoFile: 'Upload Video'
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
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-8">
        <p className="text-xl font-bold uppercase tracking-widest text-neutral-400 text-center">
          Admin panel is disabled.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-24 px-4 sm:px-8">
      <header className="mb-16 md:mb-24">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter uppercase text-neutral-900 dark:text-white mb-6">
          {copy.title}
        </h1>
        <p className="text-lg md:text-xl text-neutral-500 font-medium max-w-2xl mb-12">
          {copy.subtitle}
        </p>

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-neutral-200 dark:border-neutral-800 pb-12">
          <div className="flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-500 border border-neutral-200 dark:border-neutral-800 px-4 py-3">
            <AlertCircle size={16} strokeWidth={1.5} />
            {copy.securityNote}
          </div>

          {remoteEnabled && (
            <div className="flex items-center border border-neutral-200 dark:border-neutral-800 p-1">
              <button
                type="button"
                onClick={() => setPublishMode('local')}
                className={`px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                  publishMode === 'local'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {copy.modeLocal}
              </button>
              <button
                type="button"
                onClick={() => setPublishMode('remote')}
                className={`px-6 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                  publishMode === 'remote'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {copy.modeRemote}
              </button>
            </div>
          )}
        </div>
      </header>

      {!isUnlocked ? (
        <form onSubmit={handleLogin} className="max-w-md border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12">
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-8 text-neutral-900 dark:text-white">
            {copy.loginTitle}
          </h2>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={copy.passwordPlaceholder}
            className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none mb-8"
            required
          />
          {authError && <p className="mb-6 text-xs uppercase tracking-widest font-bold text-rose-500">{authError}</p>}
          <button
            type="submit"
            className="w-full py-4 bg-neutral-900 text-white dark:bg-white dark:text-black text-sm uppercase tracking-widest font-bold hover:opacity-80 transition-opacity"
          >
            {copy.loginButton}
          </button>
        </form>
      ) : (
        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-16 lg:gap-24">
          <div>
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
                {copy.formTitle}
              </h2>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <LogOut size={14} strokeWidth={2} />
                {copy.logout}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder={copy.fields.title}
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
                  required
                />
                <input
                  value={form.titleRu}
                  onChange={(event) => setForm((prev) => ({ ...prev, titleRu: event.target.value }))}
                  placeholder={copy.fields.titleRu}
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <input
                  value={form.project}
                  onChange={(event) => setForm((prev) => ({ ...prev, project: event.target.value }))}
                  placeholder={copy.fields.project}
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
                  required
                />
                <input
                  value={form.projectRu}
                  onChange={(event) => setForm((prev) => ({ ...prev, projectRu: event.target.value }))}
                  placeholder={copy.fields.projectRu}
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
                />
              </div>

              <input
                value={form.polygons}
                onChange={(event) => setForm((prev) => ({ ...prev, polygons: event.target.value }))}
                placeholder={copy.fields.polygons}
                className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none"
              />

              <div className="grid sm:grid-cols-2 gap-8">
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder={copy.fields.description}
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 min-h-[100px] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none resize-y"
                  required
                />
                <textarea
                  value={form.descriptionRu}
                  onChange={(event) => setForm((prev) => ({ ...prev, descriptionRu: event.target.value }))}
                  placeholder={copy.fields.descriptionRu}
                  className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 min-h-[100px] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none resize-y"
                />
              </div>

              {/* Uploads Grid */}
              <div className="space-y-4 pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={form.thumbnail}
                    onChange={(event) => setForm((prev) => ({ ...prev, thumbnail: event.target.value }))}
                    placeholder={copy.fields.thumbnailUrl}
                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none text-sm"
                  />
                  <label className="w-full flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-500 truncate pr-4">
                      {uploads.thumbnail ? uploads.thumbnail.name : copy.fields.thumbnailFile}
                    </span>
                    <Upload size={16} strokeWidth={1.5} className="text-neutral-400 shrink-0" />
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setUploadFile('thumbnail', event.target.files)} />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={form.renderUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, renderUrl: event.target.value }))}
                    placeholder={copy.fields.renderUrl}
                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none text-sm"
                  />
                  <label className="w-full flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-500 truncate pr-4">
                      {uploads.render ? uploads.render.name : copy.fields.renderFile}
                    </span>
                    <Upload size={16} strokeWidth={1.5} className="text-neutral-400 shrink-0" />
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setUploadFile('render', event.target.files)} />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={form.wireframeUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, wireframeUrl: event.target.value }))}
                    placeholder={copy.fields.wireframeUrl}
                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none text-sm"
                  />
                  <label className="w-full flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-500 truncate pr-4">
                      {uploads.wireframe ? uploads.wireframe.name : copy.fields.wireframeFile}
                    </span>
                    <Upload size={16} strokeWidth={1.5} className="text-neutral-400 shrink-0" />
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setUploadFile('wireframe', event.target.files)} />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    value={form.modelUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, modelUrl: event.target.value }))}
                    placeholder={copy.fields.modelUrl}
                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none text-sm"
                  />
                  <label className="w-full flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-500 truncate pr-4">
                      {uploads.model ? uploads.model.name : copy.fields.modelFile}
                    </span>
                    <Upload size={16} strokeWidth={1.5} className="text-neutral-400 shrink-0" />
                    <input type="file" accept=".glb,model/gltf-binary" className="hidden" onChange={(event) => setUploadFile('model', event.target.files)} />
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as GalleryTab }))}
                      className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-white transition-colors rounded-none cursor-pointer appearance-none text-sm uppercase tracking-widest font-bold"
                    >
                      <option value="props" className="text-black dark:text-black">{copy.prop}</option>
                      <option value="cinematics" className="text-black dark:text-black">{copy.cinematic}</option>
                    </select>
                  </div>
                  <input
                    value={form.videoUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                    placeholder={copy.fields.videoUrl}
                    className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-neutral-900 dark:focus:border-white outline-none transition-colors rounded-none text-sm"
                  />
                </div>

                <label className="w-full flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors mt-4">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-neutral-500 truncate pr-4">
                    {uploads.video ? uploads.video.name : copy.fields.videoFile}
                  </span>
                  <Upload size={16} strokeWidth={1.5} className="text-neutral-400 shrink-0" />
                  <input type="file" accept="video/mp4,video/webm,video/quicktime,video/*" className="hidden" onChange={(event) => setUploadFile('video', event.target.files)} />
                </label>
              </div>

              {submitError && <p className="text-xs uppercase tracking-widest font-bold text-rose-500">{submitError}</p>}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full mt-8 py-5 bg-neutral-900 text-white dark:bg-white dark:text-black text-sm uppercase tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? copy.saving : copy.submit}
              </button>
            </form>
          </div>

          <aside>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-12 pb-6 border-b border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
              {publishMode === 'remote' && remoteEnabled ? copy.customListRemote : copy.customListLocal}
            </h2>
            <div className="space-y-4">
              {works.length === 0 && (
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{copy.empty}</p>
              )}
              {works.map((work) => {
                const workTitle = language === 'ru' ? work.titleRu ?? work.title : work.title;
                const workProject = language === 'ru' ? work.projectRu ?? work.project : work.project;

                return (
                  <div
                    key={work.id}
                    className="p-4 border border-neutral-200 dark:border-neutral-800 flex justify-between items-center group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <div className="truncate pr-4">
                      <p className="font-bold text-sm uppercase tracking-tight text-neutral-900 dark:text-white truncate">{workTitle}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1 truncate">{workProject}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(work.id)}
                      className="p-2 text-neutral-400 hover:text-rose-500 transition-colors shrink-0"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
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
