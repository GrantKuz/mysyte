import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Box } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const { language, setLanguage } = useLanguage();

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
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <Box size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">GK.ART</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex gap-2">
            {[
              { name: 'Home', path: '/' },
              { name: 'Gallery', path: '/gallery' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 md:px-5 py-2 text-sm font-bold transition-colors"
              >
                <span className={location.pathname === item.path ? 'text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}>
                  {item.name}
                </span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full mx-3 md:mx-5"
                  />
                )}
              </Link>
            ))}
          </div>
          
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 hidden md:block"></div>
          
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors uppercase"
          >
            {language === 'en' ? 'EN / ru' : 'en / RU'}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
