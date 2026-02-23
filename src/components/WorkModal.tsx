import { motion, AnimatePresence } from 'motion/react';
import { X, Box, Layers, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Work } from '../types';
import { useEffect, useState } from 'react';
import ThreeViewer from './ThreeViewer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../contexts/LanguageContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkModalProps {
  work: Work;
  onClose: () => void;
}

export default function WorkModal({ work, onClose }: WorkModalProps) {
  const [showWireframe, setShowWireframe] = useState(false);
  const [view3D, setView3D] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isRenderLoaded, setIsRenderLoaded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const { language, t } = useLanguage();

  const images = work.images && work.images.length > 0 
    ? work.images 
    : [{ renderUrl: work.renderUrl, wireframeUrl: work.wireframeUrl }];

  const currentImage = images[imageIndex];
  const title = language === 'ru' ? work.titleRu ?? work.title : work.title;
  const project = language === 'ru' ? work.projectRu ?? work.project : work.project;
  const description = language === 'ru' ? work.descriptionRu ?? work.description : work.description;
  const showVideo = work.type === 'cinematic' && Boolean(work.videoUrl);
  const showRenderImage = !view3D && !showVideo;

  useEffect(() => {
    setImageIndex(0);
    setShowWireframe(false);
    setView3D(false);
    setIsRenderLoaded(false);
    setIsVideoLoaded(false);
  }, [work.id]);

  useEffect(() => {
    setIsRenderLoaded(false);
  }, [imageIndex, currentImage.renderUrl, work.id]);

  useEffect(() => {
    setIsVideoLoaded(false);
  }, [work.videoUrl, work.id]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev + 1) % images.length);
    setShowWireframe(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setShowWireframe(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-neutral-50 dark:bg-neutral-900 w-full max-w-5xl max-h-[95vh] md:max-h-[90vh] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media Section */}
        <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 relative group min-h-[220px] sm:min-h-[300px] md:min-h-0 flex items-center justify-center">
          {/* Base Image (always present to dictate size, but hidden if view3D or video) */}
          <img
            key={`render-${imageIndex}`}
            src={currentImage.renderUrl}
            alt={title}
            onLoad={() => setIsRenderLoaded(true)}
            onError={() => setIsRenderLoaded(true)}
            className={cn(
              "w-full h-full object-contain transition-opacity duration-300",
              showRenderImage && isRenderLoaded ? "opacity-100" : "opacity-0"
            )}
            referrerPolicy="no-referrer"
          />

          {showRenderImage && !isRenderLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500 dark:text-neutral-300">
              <div className="w-8 h-8 border-2 border-current/20 border-t-current rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-wider">{t('common.loading')}</p>
            </div>
          )}

          <AnimatePresence>
            {showWireframe && currentImage.wireframeUrl && !view3D && work.type !== 'cinematic' && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={currentImage.wireframeUrl}
                alt={t('modal.wireframe.alt')}
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen pointer-events-none"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {view3D && work.modelUrl && (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full"
              >
                <ThreeViewer modelUrl={work.modelUrl} />
              </motion.div>
            )}
          </AnimatePresence>

          {showVideo && work.videoUrl && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-300">
                  <div className="w-8 h-8 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                  <p className="text-xs uppercase tracking-wider">{t('common.loading')}</p>
                </div>
              )}
              <video
                src={work.videoUrl}
                controls
                autoPlay
                preload="metadata"
                onLoadedData={() => setIsVideoLoaded(true)}
                onCanPlay={() => setIsVideoLoaded(true)}
                onError={() => setIsVideoLoaded(true)}
                className={cn(
                  "max-w-full max-h-full transition-opacity duration-300",
                  isVideoLoaded ? "opacity-100" : "opacity-0"
                )}
              />
            </div>
          )}

          {images.length > 1 && !view3D && work.type !== 'cinematic' && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
              </button>
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 text-white text-xs px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md">
                {imageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-auto flex flex-wrap gap-2 sm:gap-3 z-10">
            {currentImage.wireframeUrl && !view3D && work.type !== 'cinematic' && (
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all",
                  showWireframe 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                    : "bg-white/90 text-neutral-900 hover:bg-white"
                )}
              >
                <Layers size={14} />
                {showWireframe ? t('modal.wireframe.hide') : t('modal.wireframe.show')}
              </button>
            )}
            {work.modelUrl && (
              <button
                onClick={() => setView3D(!view3D)}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-medium transition-all",
                  view3D 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                    : "bg-white/90 text-neutral-900 hover:bg-white"
                )}
              >
                <Box size={14} />
                {view3D ? t('modal.3d.hide') : t('modal.3d.show')}
              </button>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-80 p-5 sm:p-8 flex flex-col gap-5 sm:gap-6 overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                {title}
              </h2>
              <p className="text-sm text-neutral-500 font-medium mt-1">
                {project}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <Info size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">{t('modal.triangles')}</p>
                <p className="text-sm font-mono">{work.polygons}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
