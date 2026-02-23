import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ADMIN_ENABLED, ADMIN_ROUTE_PATH } from './config/admin';

const Admin = lazy(() => import('./pages/Admin'));

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <Router>
          <div className="relative min-h-screen overflow-x-hidden bg-[#f7f8f5] dark:bg-[#0d1317] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-emerald-500/30">
            <div className="pointer-events-none fixed inset-0 -z-10">
              <div className="absolute -top-24 left-[6%] h-72 w-72 rounded-full bg-emerald-400/20 dark:bg-emerald-500/20 blur-3xl" />
              <div className="absolute top-[18%] right-[8%] h-80 w-80 rounded-full bg-cyan-400/20 dark:bg-cyan-500/20 blur-3xl" />
              <div className="absolute bottom-[-8%] left-[32%] h-96 w-96 rounded-full bg-amber-300/20 dark:bg-amber-500/10 blur-3xl" />
            </div>

            <Navbar />
            <main className="pt-16 sm:pt-20">
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
