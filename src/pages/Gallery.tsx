import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { works as baseWorks } from '../data/works';
import { Work, GalleryTab } from '../types';
import GalleryGrid from '../components/GalleryGrid';
import WorkModal from '../components/WorkModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { loadCustomWorks, onCustomWorksUpdated } from '../lib/workStorage';
import { isRemoteCatalogEnabled, loadRemoteWorks, onRemoteWorksUpdated } from '../lib/remoteCatalog';

const ITEMS_PER_PAGE = 6;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-8">
      <header className="py-12 md:py-24">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter uppercase mb-8 sm:mb-16 text-neutral-900 dark:text-white">
          {t('gallery.title')}
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <p className="text-lg md:text-xl text-neutral-500 max-w-md font-medium">
            {t('gallery.desc')}
          </p>
          <div className="flex gap-6 sm:gap-8">
            <button
              onClick={() => setActiveTab('props')}
              className={`pb-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'props' 
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                  : 'border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t('gallery.tab.props')}
            </button>
            <button
              onClick={() => setActiveTab('cinematics')}
              className={`pb-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'cinematics' 
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                  : 'border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {t('gallery.tab.cinematics')}
            </button>
          </div>
        </div>
      </header>

      <GalleryGrid 
        works={paginatedWorks} 
        onWorkClick={(work) => setSelectedWork(work)} 
      />

      {totalPages > 1 && (
        <div className="mt-16 sm:mt-24 flex items-center justify-center gap-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">
            {currentPage} <span className="text-neutral-400 mx-2">/</span> {totalPages}
          </p>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} strokeWidth={1.5} />
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
