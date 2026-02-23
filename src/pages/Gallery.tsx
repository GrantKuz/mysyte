import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { works as baseWorks } from '../data/works';
import { Work, GalleryTab } from '../types';
import GalleryGrid from '../components/GalleryGrid';
import WorkModal from '../components/WorkModal';
import { Box, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { loadCustomWorks, onCustomWorksUpdated } from '../lib/workStorage';
import { isRemoteCatalogEnabled, loadRemoteWorks, onRemoteWorksUpdated } from '../lib/remoteCatalog';

const ITEMS_PER_PAGE = 20;

export default function Gallery() {
  const [activeTab, setActiveTab] = useState<GalleryTab>('props');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [customWorks, setCustomWorks] = useState<Work[]>(() => loadCustomWorks());
  const [remoteWorks, setRemoteWorks] = useState<Work[]>([]);
  const { t } = useLanguage();
  const remoteCatalogEnabled = isRemoteCatalogEnabled();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    const syncWorks = () => {
      setCustomWorks(loadCustomWorks());
    };

    syncWorks();
    return onCustomWorksUpdated(syncWorks);
  }, []);

  useEffect(() => {
    if (!remoteCatalogEnabled) {
      setRemoteWorks([]);
      return;
    }

    let disposed = false;
    const syncRemoteWorks = async () => {
      try {
        const works = await loadRemoteWorks();
        if (!disposed) setRemoteWorks(works);
      } catch {
        if (!disposed) setRemoteWorks([]);
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
  }, [remoteCatalogEnabled]);

  const allWorks = useMemo(() => {
    const merged = [...remoteWorks, ...customWorks, ...baseWorks];
    const unique = new Map<string, Work>();

    for (const work of merged) {
      if (!unique.has(work.id)) {
        unique.set(work.id, work);
      }
    }

    return [...unique.values()];
  }, [customWorks, remoteWorks]);

  const filteredWorks = useMemo(
    () =>
      allWorks.filter((work) =>
        activeTab === 'props' ? work.type === 'prop' : work.type === 'cinematic'
      ),
    [activeTab, allWorks]
  );

  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedWorks = filteredWorks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <header className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 rounded-3xl p-5 sm:p-7 border border-white/60 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-2">{t('gallery.title')}</h1>
          <p className="text-neutral-500">{t('gallery.desc')}</p>
        </div>

        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('props')}
            className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'props' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Box size={16} />
            {t('gallery.tab.props')}
          </button>
          <button
            onClick={() => setActiveTab('cinematics')}
            className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'cinematics' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Film size={16} />
            {t('gallery.tab.cinematics')}
          </button>
        </div>
      </header>

      <GalleryGrid 
        works={paginatedWorks} 
        onWorkClick={(work) => setSelectedWork(work)} 
      />

      {totalPages > 1 && (
        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            {t('gallery.pagination.prev')}
          </button>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-300 min-w-[90px] text-center">
            {t('gallery.pagination.page')} {currentPage} / {totalPages}
          </p>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('gallery.pagination.next')}
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedWork && (
          <WorkModal 
            work={selectedWork} 
            onClose={() => setSelectedWork(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
