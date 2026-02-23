import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Work } from '../types';
import { Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAssetUrl } from '../hooks/useAssetUrl';

interface GalleryGridProps {
  works: Work[];
  onWorkClick: (work: Work) => void;
}

interface GalleryCardProps {
  work: Work;
  index: number;
  onWorkClick: (work: Work) => void;
}

function GalleryCard({ work, index, onWorkClick }: GalleryCardProps) {
  const { language, t } = useLanguage();
  const { url: thumbnailUrl, isResolving } = useAssetUrl(work.thumbnail);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [thumbnailUrl, work.id]);

  const title = language === 'ru' ? work.titleRu ?? work.title : work.title;
  const project = language === 'ru' ? work.projectRu ?? work.project : work.project;
  const showLoader = isResolving || !thumbnailUrl || !isLoaded;

  return (
    <motion.div
      key={work.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onWorkClick(work)}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100/80 dark:bg-neutral-800/70 border border-white/60 dark:border-neutral-700/60 cursor-pointer shadow-lg shadow-black/5 dark:shadow-black/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
    >
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          draggable={false}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          sizes="(max-width: 768px) 48vw, (max-width: 1024px) 31vw, 24vw"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          onDragStart={(event) => event.preventDefault()}
          onContextMenu={(event) => event.preventDefault()}
          className={`w-full h-full object-cover transition-all duration-500 ${
            !showLoader ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-105'
          }`}
          referrerPolicy="no-referrer"
        />
      )}

      {showLoader && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500 dark:text-neutral-300 bg-gradient-to-br from-white/70 to-neutral-100/40 dark:from-neutral-900/40 dark:to-neutral-800/40">
          <div className="w-7 h-7 border-2 border-current/20 border-t-current rounded-full animate-spin" />
          <p className="text-[11px] uppercase tracking-wider">{t('common.loading')}</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
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
}

export default function GalleryGrid({ works, onWorkClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {works.map((work, index) => (
        <GalleryCard
          key={work.id}
          work={work}
          index={index}
          onWorkClick={onWorkClick}
        />
      ))}
    </div>
  );
}
