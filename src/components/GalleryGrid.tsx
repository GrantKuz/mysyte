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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.8 }}
      onClick={() => onWorkClick(work)}
      className="group relative aspect-[4/5] bg-neutral-100 dark:bg-neutral-900 overflow-hidden cursor-pointer"
    >
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={title}
          draggable={false}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
          onDragStart={(event) => event.preventDefault()}
          onContextMenu={(event) => event.preventDefault()}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            !showLoader ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-110'
          }`}
          referrerPolicy="no-referrer"
        />
      )}

      {showLoader && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 bg-neutral-100 dark:bg-neutral-900">
           <p className="text-[10px] uppercase tracking-[0.2em] font-bold animate-pulse">{t('common.loading')}</p>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-700 pointer-events-none" />
      
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col justify-end pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div>
            <p className="text-white font-bold text-xl md:text-2xl uppercase tracking-tighter leading-none mb-2">{title}</p>
            <p className="text-white/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{project}</p>
          </div>
          {work.type === 'cinematic' && (
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
              <Play size={16} className="fill-white" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryGrid({ works, onWorkClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
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
