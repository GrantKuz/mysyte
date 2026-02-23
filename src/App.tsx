import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#1b1d1e] text-neutral-100 font-sans selection:bg-emerald-500/30">
          <Navbar />
          <main className="pt-16 sm:pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}
