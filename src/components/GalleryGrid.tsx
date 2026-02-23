import { motion } from 'motion/react';
import { Work, GalleryTab } from '../types';
import { Play } from 'lucide-react';

interface GalleryGridProps {
  works: Work[];
  onWorkClick: (work: Work) => void;
}

export default function GalleryGrid({ works, onWorkClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {works.map((work, index) => (
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
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm leading-tight">{work.title}</p>
                <p className="text-white/70 text-[10px] uppercase tracking-wider mt-0.5">{work.project}</p>
              </div>
              {work.type === 'cinematic' && (
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                  <Play size={14} className="text-white fill-white" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
