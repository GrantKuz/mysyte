import { motion, AnimatePresence } from 'motion/react';
import { Mail, Instagram, ExternalLink, Box, Palette, Zap, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <section className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center mb-12 sm:mb-16 rounded-3xl p-5 sm:p-8 border border-white/60 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden bg-neutral-200 shadow-xl relative group ring-4 ring-white/60 dark:ring-white/10"
        >
          <img 
            src="/img/profile.png" 
            alt="Artist Profile" 
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 border-4 border-white/20 rounded-3xl pointer-events-none" />
        </motion.div>

        <div className="flex-1 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4 tracking-tight flex flex-col sm:flex-row items-center sm:items-baseline justify-center md:justify-start gap-1 sm:gap-4"
          >
            <span>Gleb <span className="text-emerald-500">Kuzn</span></span>
            <span className="text-lg sm:text-2xl font-medium text-[#a1a1a1]">{t('home.age')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-neutral-600 dark:text-neutral-400 mb-6 sm:mb-8 font-medium"
          >
            {t('role')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start"
          >
            <Link 
              to="/gallery" 
              className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-neutral-900/20"
            >
              {t('viewWorks')}
            </Link>
            <button 
              onClick={() => setIsContactOpen(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-2xl font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('getInTouch')}
            </button>
          </motion.div>
        </div>
      </section>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12 sm:mb-16 rounded-3xl p-5 sm:p-7 border border-white/60 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20"
      >
        <h2 className="text-2xl font-bold mb-5 sm:mb-6 text-neutral-900 dark:text-white">{t('software')}</h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {['Blender 3D', 'Adobe Substance 3D Painter', 'Adobe Photoshop', 'ZBrush'].map((software, i) => (
            <div key={i} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/90 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm sm:text-base font-medium text-neutral-800 dark:text-neutral-200">
              {software}
            </div>
          ))}
        </div>
      </motion.section>

      <div className="grid md:grid-cols-3 gap-5 sm:gap-8 mb-12 sm:mb-16">
        {[
          { icon: <Box className="text-blue-500" />, title: t('skills.prop.title'), desc: t('skills.prop.desc') },
          { icon: <Palette className="text-emerald-500" />, title: t('skills.texturing.title'), desc: t('skills.texturing.desc') },
          { icon: <Zap className="text-amber-500" />, title: t('skills.opt.title'), desc: t('skills.opt.desc') }
        ].map((skill, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-6 sm:p-8 bg-white/80 dark:bg-neutral-900/70 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-md shadow-black/5 dark:shadow-black/20 hover:-translate-y-1 hover:shadow-xl transition-all"
          >
            <div className="mb-4">{skill.icon}</div>
            <h3 className="text-lg font-bold mb-2">{skill.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{skill.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="prose dark:prose-invert max-w-none mb-10 sm:mb-12"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">{t('about.title')}</h2>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5 sm:mb-6">
          {t('about.p1')}
        </p>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t('about.p2')}
        </p>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-none"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-neutral-900 dark:text-white">{t('exp.title')}</h2>
        <div className="space-y-5 sm:space-y-8">
          {[
            {
              role: t('exp.job1.role'),
              company: t('exp.job1.company'),
              period: t('exp.job1.period'),
              description: t('exp.job1.desc')
            },
            {
              role: t('exp.job2.role'),
              company: t('exp.job2.company'),
              period: t('exp.job2.period'),
              description: t('exp.job2.desc')
            },
            {
              role: t('exp.job3.role'),
              company: t('exp.job3.company'),
              period: t('exp.job3.period'),
              description: t('exp.job3.desc')
            }
          ].map((job, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 md:gap-8 p-5 sm:p-6 bg-white/80 dark:bg-neutral-900/70 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-md shadow-black/5 dark:shadow-black/20 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="md:w-1/4 flex-shrink-0">
                <p className="text-emerald-500 font-bold text-sm uppercase tracking-wider mb-1">{job.period}</p>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{job.company}</h3>
              </div>
              <div className="md:w-3/4">
                <h4 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">{job.role}</h4>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{job.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <footer className="mt-12 sm:mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <p className="text-sm text-neutral-500 text-left">{t('footer.rights')}</p>
        <div className="flex gap-4">
          <a href="#" className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl hover:text-emerald-500 transition-colors">
            <Instagram size={20} />
          </a>
          <a href="https://t.me/kuznecoff_3d" target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl hover:text-emerald-500 transition-colors">
            <Send size={20} />
          </a>
          <a href="#" className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl hover:text-emerald-500 transition-colors">
            <ExternalLink size={20} />
          </a>
        </div>
      </footer>

      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsContactOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-neutral-900 p-5 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-neutral-100 dark:border-neutral-800"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-neutral-900 dark:text-white">{t('contact.title')}</h3>
              <div className="space-y-3">
                <a href="mailto:hello@glebkuzn.com" className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
                  <div className="p-2 bg-white dark:bg-neutral-700 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <Mail size={20} className="text-neutral-700 dark:text-neutral-300" />
                  </div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300 break-all">hello@glebkuzn.com</span>
                </a>
                <a href="https://t.me/kuznecoff_3d" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
                  <div className="p-2 bg-white dark:bg-neutral-700 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <Send size={20} className="text-blue-500" />
                  </div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">@kuznecoff_3d</span>
                </a>
                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
                  <div className="p-2 bg-white dark:bg-neutral-700 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <Instagram size={20} className="text-pink-500" />
                  </div>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">@gleb.kuzn</span>
                </a>
              </div>
              <button 
                onClick={() => setIsContactOpen(false)}
                className="mt-8 w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                {t('contact.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
