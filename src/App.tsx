import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import CustomCursor from './components/CustomCursor';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ADMIN_ENABLED, ADMIN_ROUTE_PATH } from './config/admin';

const Admin = lazy(() => import('./pages/Admin'));

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Экран загрузки висит 1.8 секунды
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease }}
          className="fixed inset-0 z-[100] bg-[#fafafa] dark:bg-[#030303] flex flex-col items-center justify-center gap-6"
        >
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold tracking-tighter uppercase text-neutral-900 dark:text-white"
            >
              GK.ART
            </motion.div>
          </div>
          <div className="w-32 h-px bg-neutral-200 dark:bg-neutral-800 relative overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
              className="absolute top-0 bottom-0 w-full bg-neutral-900 dark:bg-white"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <Preloader />
          <CustomCursor />
          <div className="relative min-h-screen overflow-x-hidden bg-[#fafafa] dark:bg-[#030303] text-neutral-900 dark:text-[#eaeaea] font-sans selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] dark:opacity-[0.03] bg-noise mix-blend-difference" />
            <Navbar />
            <main className="pt-24 sm:pt-32 pb-16 relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<Gallery />} />
                {ADMIN_ENABLED && (
                  <Route
                    path={ADMIN_ROUTE_PATH}
                    element={
                      <Suspense fallback={null}>
                        <Admin />
                      </Suspense>
                    }
                  />
                )}
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}
