import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Work } from '../types';
import { Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GalleryGridProps {
  works: Work[];
  onWorkClick: (work: Work) => void;
}

export default function GalleryGrid({ works, onWorkClick }: GalleryGridProps) {
  const [loadedThumbnails, setLoadedThumbnails] = useState<Record<string, boolean>>({});
  const { language, t } = useLanguage();
  const worksSignature = works.map((work) => work.id).join('|');

  useEffect(() => {
    setLoadedThumbnails({});
  }, [worksSignature]);

  const markThumbnailLoaded = (workId: string) => {
    setLoadedThumbnails((prev) => {
      if (prev[workId]) return prev;
      return { ...prev, [workId]: true };
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {works.map((work, index) => {
        const isLoaded = Boolean(loadedThumbnails[work.id]);
        const title = language === 'ru' ? work.titleRu ?? work.title : work.title;
        const project = language === 'ru' ? work.projectRu ?? work.project : work.project;

        return (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onWorkClick(work)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer"
          >
            <img
              src={work.thumbnail}
              alt={title}
              onLoad={() => markThumbnailLoaded(work.id)}
              onError={() => markThumbnailLoaded(work.id)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-105'
              }`}
              referrerPolicy="no-referrer"
            />

            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500 dark:text-neutral-300">
                <div className="w-7 h-7 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                <p className="text-[11px] uppercase tracking-wider">{t('common.loading')}</p>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-xs sm:text-sm leading-tight">{title}</p>
                  <p className="text-white/70 text-[10px] uppercase tracking-wider mt-0.5">{project}</p>
                </div>
                {work.type === 'cinematic' && (
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                    <Play size={14} className="text-white fill-white" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
