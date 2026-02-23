import { motion, AnimatePresence } from 'motion/react';
import { X, Box, Layers, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Work } from '../types';
import { useEffect, useState, type MouseEvent } from 'react';
import ThreeViewer from './ThreeViewer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../contexts/LanguageContext';
import { useAssetUrl } from '../hooks/useAssetUrl';

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

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const images =
    work.images && work.images.length > 0
      ? work.images
      : [{ renderUrl: work.renderUrl, wireframeUrl: work.wireframeUrl }];

  const currentImage = images[imageIndex];
  const title = language === 'ru' ? work.titleRu ?? work.title : work.title;
  const project = language === 'ru' ? work.projectRu ?? work.project : work.project;
  const description = language === 'ru' ? work.descriptionRu ?? work.description : work.description;
  const showVideo = work.type === 'cinematic' && Boolean(work.videoUrl);
  const showRenderImage = !view3D && !showVideo;

  const { url: renderSrc, isResolving: renderResolving } = useAssetUrl(currentImage.renderUrl);
  const { url: wireframeSrc, isResolving: wireframeResolving } = useAssetUrl(currentImage.wireframeUrl);
  const { url: videoSrc, isResolving: videoResolving } = useAssetUrl(showVideo ? work.videoUrl : undefined);
  const { url: modelSrc, isResolving: modelResolving } = useAssetUrl(work.modelUrl);

  useEffect(() => {
    setImageIndex(0);
    setShowWireframe(false);
    setView3D(false);
    setIsRenderLoaded(false);
    setIsVideoLoaded(false);
  }, [work.id]);

  useEffect(() => {
    setIsRenderLoaded(false);
  }, [renderSrc, imageIndex, work.id]);

  useEffect(() => {
    setIsVideoLoaded(false);
  }, [videoSrc, work.id]);

  const handleNext = (event: MouseEvent) => {
    event.stopPropagation();
    setImageIndex((prev) => (prev + 1) % images.length);
    setShowWireframe(false);
  };

  const handlePrev = (event: MouseEvent) => {
    event.stopPropagation();
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setShowWireframe(false);
  };

  const showRenderLoader = showRenderImage && (renderResolving || !renderSrc || !isRenderLoaded);
  const showVideoLoader = showVideo && (videoResolving || !videoSrc || !isVideoLoaded);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 lg:p-12 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 20 }}
        transition={{ duration: 0.8, ease }}
        className="bg-white dark:bg-[#0a0a0a] w-full h-full max-w-[1400px] flex flex-col md:flex-row shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-8 md:right-8 z-50 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <X size={32} strokeWidth={1} />
        </button>

        <div className="flex-1 bg-neutral-100 dark:bg-[#050505] relative group min-h-[40vh] md:min-h-0 flex items-center justify-center overflow-hidden">
          {renderSrc && (
            <img
              key={`render-${imageIndex}`}
              src={renderSrc}
              alt={title}
              draggable={false}
              onLoad={() => setIsRenderLoaded(true)}
              onError={() => setIsRenderLoaded(true)}
              onDragStart={(event) => event.preventDefault()}
              onContextMenu={(event) => event.preventDefault()}
              className={cn(
                'w-full h-full object-contain transition-opacity duration-700',
                showRenderImage && !showRenderLoader ? 'opacity-100' : 'opacity-0'
              )}
              referrerPolicy="no-referrer"
            />
          )}

          {showRenderLoader && (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">{t('common.loading')}</p>
            </div>
          )}

          <AnimatePresence>
            {showWireframe && wireframeSrc && !wireframeResolving && !view3D && work.type !== 'cinematic' && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease }}
                src={wireframeSrc}
                alt={t('modal.wireframe.alt')}
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
                onContextMenu={(event) => event.preventDefault()}
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen pointer-events-none"
                referrerPolicy="no-referrer"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {view3D && (
              <motion.div
                key="3d"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease }}
                className="absolute inset-0 w-full h-full"
              >
                {modelSrc && !modelResolving ? (
                  <ThreeViewer modelUrl={modelSrc} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">{t('common.loading')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {showVideo && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
              {showVideoLoader && (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">{t('common.loading')}</p>
                </div>
              )}
              {videoSrc && (
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  preload="metadata"
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onLoadedData={() => setIsVideoLoaded(true)}
                  onCanPlay={() => setIsVideoLoaded(true)}
                  onError={() => setIsVideoLoaded(true)}
                  onContextMenu={(event) => event.preventDefault()}
                  className={cn(
                    'max-w-full max-h-full transition-opacity duration-700',
                    !showVideoLoader ? 'opacity-100' : 'opacity-0'
                  )}
                />
              )}
            </div>
          )}

          {images.length > 1 && !view3D && work.type !== 'cinematic' && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft size={32} strokeWidth={1} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <ChevronRight size={32} strokeWidth={1} />
              </button>
              <div className="absolute bottom-8 right-8 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {imageIndex + 1} / {images.length}
              </div>
            </>
          )}

          <div className="absolute bottom-6 left-6 flex flex-wrap gap-4 z-10">
            {currentImage.wireframeUrl && !view3D && work.type !== 'cinematic' && (
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border bg-white/5 backdrop-blur-sm',
                  showWireframe
                    ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white'
                    : 'text-neutral-500 border-neutral-300 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white'
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
                  'flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border bg-white/5 backdrop-blur-sm',
                  view3D
                    ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white'
                    : 'text-neutral-500 border-neutral-300 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white'
                )}
              >
                <Box size={14} />
                {view3D ? t('modal.3d.hide') : t('modal.3d.show')}
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-[400px] lg:w-[480px] p-8 md:p-12 flex flex-col justify-start pt-16 md:pt-24 gap-8 overflow-y-auto bg-white dark:bg-[#0a0a0a]">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight leading-none mb-4 break-words hyphens-auto">
              {title}
            </h2>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">{project}</p>
          </div>

          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-900 shrink-0" />

          <div className="flex items-center gap-4 text-neutral-900 dark:text-white">
            <Info size={16} className="text-neutral-400" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">{t('modal.triangles')}</p>
              <p className="text-sm font-mono font-medium">{work.polygons}</p>
            </div>
          </div>

          <div className="w-full h-px bg-neutral-200 dark:bg-neutral-900 shrink-0" />

          <p className="text-base text-neutral-500 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
