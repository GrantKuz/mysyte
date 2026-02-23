import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Box } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#1b1d1e]/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <Box size={18} />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight">GK.ART</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex gap-1 sm:gap-2">
            {[
              { name: t('nav.home'), path: '/' },
              { name: t('nav.gallery'), path: '/gallery' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
              >
                <span className={location.pathname === item.path ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}>
                  {item.name}
                </span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full mx-2.5 sm:mx-4"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="hidden md:block text-[10px] uppercase tracking-wider text-neutral-500">
              {t('nav.language')}
            </span>
            <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors ${
                  language === 'en'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
                aria-pressed={language === 'en'}
                title={language === 'en' ? 'Current language: English' : 'Switch to English'}
              >
                {t('nav.lang.en')}
              </button>
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors ${
                  language === 'ru'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
                aria-pressed={language === 'ru'}
                title={language === 'ru' ? 'Текущий язык: Русский' : 'Переключить на русский'}
              >
                {t('nav.lang.ru')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
