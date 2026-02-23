import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { works } from '../data/works';
import { Work, GalleryTab } from '../types';
import GalleryGrid from '../components/GalleryGrid';
import WorkModal from '../components/WorkModal';
import { Box, Film } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Gallery() {
  const [activeTab, setActiveTab] = useState<GalleryTab>('props');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const { t } = useLanguage();

  const filteredWorks = works.filter(w => 
    activeTab === 'props' ? w.type === 'prop' : w.type === 'cinematic'
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">Portfolio</h1>
          <p className="text-neutral-500">{t('gallery.desc')}</p>
        </div>

        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('props')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'props' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Box size={16} />
            Props
          </button>
          <button
            onClick={() => setActiveTab('cinematics')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'cinematics' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Film size={16} />
            Cinematics
          </button>
        </div>
      </header>

      <GalleryGrid 
        works={filteredWorks} 
        onWorkClick={(work) => setSelectedWork(work)} 
      />

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
