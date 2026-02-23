import { FormEvent, useMemo, useState } from 'react';
import { Lock, LogOut, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { Work, GalleryTab } from '../types';
import { addCustomWork, loadCustomWorks, removeCustomWork } from '../lib/workStorage';
import { useLanguage } from '../contexts/LanguageContext';
import { ADMIN_ENABLED } from '../config/admin';

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

export default function Admin() {
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'ok';
  });
  const [authError, setAuthError] = useState('');
  const [form, setForm] = useState<WorkFormState>(initialFormState);
  const [customWorks, setCustomWorks] = useState<Work[]>(() => loadCustomWorks());
  const isPasswordConfigured = DEFAULT_ADMIN_PASSWORD.length >= 12;

  const copy = useMemo(
    () =>
      language === 'ru'
        ? {
            title: 'Панель администратора',
            subtitle: 'Добавляйте новые работы прямо через сайт.',
            securityNote:
              'Важно: защита только на фронтенде не является надежной. Для настоящей защиты нужен backend.',
            loginTitle: 'Вход',
            passwordPlaceholder: 'Пароль администратора',
            loginButton: 'Войти',
            loginError: 'Неверный пароль',
            logout: 'Выйти',
            formTitle: 'Новая работа',
            submit: 'Добавить работу',
            customList: 'Добавленные работы',
            empty: 'Пока нет добавленных работ',
            delete: 'Удалить',
            type: 'Тип',
            prop: 'Пропс',
            cinematic: 'Синематика',
            fields: {
              title: 'Название (EN)',
              titleRu: 'Название (RU)',
              project: 'Проект (EN)',
              projectRu: 'Проект (RU)',
              polygons: 'Полигоны (например: 12,400)',
              description: 'Описание (EN)',
              descriptionRu: 'Описание (RU)',
              thumbnail: 'URL превью',
              renderUrl: 'URL рендера (опционально)',
              wireframeUrl: 'URL wireframe (опционально)',
              modelUrl: 'URL 3D модели .glb (опционально)',
              videoUrl: 'URL видео (для синематики)'
            }
          }
        : {
            title: 'Admin Panel',
            subtitle: 'Add new works directly from the website.',
            securityNote:
              'Important: frontend-only protection is not secure. True protection requires a backend.',
            loginTitle: 'Sign in',
            passwordPlaceholder: 'Admin password',
            loginButton: 'Sign in',
            loginError: 'Invalid password',
            logout: 'Logout',
            formTitle: 'New Work',
            submit: 'Add Work',
            customList: 'Added Works',
            empty: 'No custom works yet',
            delete: 'Delete',
            type: 'Type',
            prop: 'Prop',
            cinematic: 'Cinematic',
            fields: {
              title: 'Title (EN)',
              titleRu: 'Title (RU)',
              project: 'Project (EN)',
              projectRu: 'Project (RU)',
              polygons: 'Polygons (example: 12,400)',
              description: 'Description (EN)',
              descriptionRu: 'Description (RU)',
              thumbnail: 'Thumbnail URL',
              renderUrl: 'Render URL (optional)',
              wireframeUrl: 'Wireframe URL (optional)',
              modelUrl: '3D model .glb URL (optional)',
              videoUrl: 'Video URL (for cinematics)'
            }
          },
    [language]
  );

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPasswordConfigured) {
      setAuthError(language === 'ru' ? 'Пароль администратора не задан в env' : 'Admin password is not configured in env');
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isCinematic = form.type === 'cinematics';
    const thumbnail = form.thumbnail.trim();
    const renderUrl = form.renderUrl.trim() || thumbnail;
    const wireframeUrl = isCinematic ? '' : form.wireframeUrl.trim();
    const polygons = form.polygons.trim() || (isCinematic ? 'N/A' : '0');
    const modelUrl = isCinematic ? '' : form.modelUrl.trim();
    const videoUrl = isCinematic ? form.videoUrl.trim() : '';

    const newWork: Work = {
      id: `custom-${Date.now()}`,
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

    addCustomWork(newWork);
    setCustomWorks(loadCustomWorks());
    setForm(initialFormState);
  };

  const handleDelete = (workId: string) => {
    removeCustomWork(workId);
    setCustomWorks(loadCustomWorks());
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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          {copy.title}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 mt-2">{copy.subtitle}</p>
        <div className="mt-4 flex items-start gap-2 text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <span>{copy.securityNote}</span>
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
                  placeholder={copy.fields.thumbnail}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  required
                />
                <input
                  value={form.renderUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, renderUrl: event.target.value }))}
                  placeholder={copy.fields.renderUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={form.wireframeUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, wireframeUrl: event.target.value }))}
                  placeholder={copy.fields.wireframeUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
                <input
                  value={form.modelUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, modelUrl: event.target.value }))}
                  placeholder={copy.fields.modelUrl}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                />
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

              <button
                type="submit"
                className="w-full mt-3 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                {copy.submit}
              </button>
            </form>
          </div>

          <aside className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-7 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">{copy.customList}</h2>
            <div className="space-y-3">
              {customWorks.length === 0 && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{copy.empty}</p>
              )}
              {customWorks.map((work) => {
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
                      onClick={() => handleDelete(work.id)}
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
