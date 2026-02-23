import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Box, Menu, Moon, Sun, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (mobileMenuOpen) {
      setHidden(false);
      return;
    }

    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const links = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.gallery'), path: '/gallery' }
  ];

  const LanguageSwitch = (
    <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg transition-colors ${
          language === 'en'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
        }`}
        aria-pressed={language === 'en'}
        title={language === 'en' ? t('nav.language.active.en') : t('nav.language.switch.en')}
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
        title={language === 'ru' ? t('nav.language.active.ru') : t('nav.language.switch.ru')}
      >
        {t('nav.lang.ru')}
      </button>
    </div>
  );

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' }
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#0e1318]/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
              <Box size={18} />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-neutral-900 dark:text-white">GK.ART</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex gap-1 sm:gap-2">
              {links.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                >
                  <span
                    className={
                      location.pathname === item.path
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }
                  >
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

            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />

            {LanguageSwitch}

            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors grid place-items-center"
              title={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
              aria-label={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors grid place-items-center"
              title={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
              aria-label={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors grid place-items-center"
              title={mobileMenuOpen ? t('nav.menu.close') : t('nav.menu.open')}
              aria-label={mobileMenuOpen ? t('nav.menu.close') : t('nav.menu.open')}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              key="mobile-overlay"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-16 z-30 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t('nav.menu.close')}
            />

            <motion.aside
              key="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="md:hidden fixed top-16 right-0 bottom-0 z-40 w-[min(84vw,320px)] border-l border-neutral-200/60 dark:border-neutral-800/70 bg-white/95 dark:bg-[#11181f]/95 backdrop-blur-xl p-5"
            >
              <nav className="space-y-2">
                {links.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                      location.pathname === item.path
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-5 pt-5 border-t border-neutral-200 dark:border-neutral-800">
                {LanguageSwitch}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
