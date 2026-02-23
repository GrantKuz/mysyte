import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
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
    <div className="flex items-center gap-1 p-0.5 border border-neutral-200 dark:border-neutral-800 rounded-full">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all uppercase tracking-widest ${
          language === 'en'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        {t('nav.lang.en')}
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full transition-all uppercase tracking-widest ${
          language === 'ru'
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
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
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#fafafa]/80 dark:bg-[#030303]/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-white/[0.05]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 flex items-center justify-between">
          <Link to="/" className="flex items-center group shrink-0">
            <span className="font-bold text-xl sm:text-2xl tracking-tighter uppercase text-neutral-900 dark:text-white group-hover:opacity-70 transition-opacity">GK.ART</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 min-w-0">
            <div className="flex gap-6">
              {links.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative py-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap group"
                >
                  <span
                    className={
                      location.pathname === item.path
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'
                    }
                  >
                    {item.name}
                  </span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-neutral-900 dark:bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title={theme === 'dark' ? t('nav.theme.light') : t('nav.theme.dark')}
            >
              {theme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="text-neutral-900 dark:text-white"
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="md:hidden fixed inset-0 top-20 z-30 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-2xl"
            />

            <motion.aside
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed top-24 left-0 right-0 z-40 p-8 flex flex-col gap-8"
            >
              <nav className="flex flex-col gap-6">
                {links.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-2xl font-bold uppercase tracking-widest transition-colors ${
                      location.pathname === item.path
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-400'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
                {LanguageSwitch}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
