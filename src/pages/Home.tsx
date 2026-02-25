import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Mail, Instagram, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, MouseEvent } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { t, language } = useLanguage();

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const jobs = [
    { role: t('exp.job1.role'), company: t('exp.job1.company'), period: t('exp.job1.period'), desc: t('exp.job1.desc') },
    { role: t('exp.job2.role'), company: t('exp.job2.company'), period: t('exp.job2.period'), desc: t('exp.job2.desc') },
    { role: t('exp.job3.role'), company: t('exp.job3.company'), period: t('exp.job3.period'), desc: t('exp.job3.desc') }
  ];

  const software = ['Blender', 'Substance 3D Painter', 'ZBrush', 'Unreal Engine 5', 'Photoshop', 'Marmoset Toolbag'];
  const marqueeItems = [...software, ...software, ...software, ...software];
  const expertiseTitle = language === 'ru' ? 'Экспертиза' : 'Expertise';

  // 3D Tilt эффект для фото
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 overflow-hidden">
        <section className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center lg:items-end pt-12 pb-24 md:pb-40 border-b border-neutral-200 dark:border-neutral-800 perspective-[1000px]">
          <div className="flex-1 w-full order-2 lg:order-1">
            <div className="overflow-hidden">
              <motion.h1 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease }}
                className="text-6xl sm:text-8xl lg:text-[9rem] font-bold tracking-tighter uppercase leading-[0.85] text-neutral-900 dark:text-white"
              >
                Gleb<br />Kuzn
              </motion.h1>
            </div>
            <div className="mt-8 lg:mt-16 flex flex-col sm:flex-row sm:items-center gap-6">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1, ease }}
                className="text-lg md:text-xl font-medium text-neutral-500 uppercase tracking-[0.2em]"
              >
                {t('role')}
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="w-full lg:w-[420px] aspect-[4/5] bg-neutral-200 dark:bg-neutral-900 relative order-1 lg:order-2 will-change-transform"
          >
            <motion.div 
              className="absolute inset-0 bg-black/20 dark:bg-black/40 blur-xl -z-10"
              style={{ x: useTransform(mouseXSpring, [-0.5, 0.5], [-20, 20]), y: useTransform(mouseYSpring, [-0.5, 0.5], [-20, 20]) }}
            />
            <img 
              src="/img/profile.png" 
              alt="Gleb Kuzn" 
              className="w-full h-full object-cover transition-all duration-1000 object-center"
            />
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 py-24 md:py-40 border-b border-neutral-200 dark:border-neutral-800">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease }}
          >
            <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-8 sm:mb-12">{t('about.title')}</h2>
            <p className="text-xl sm:text-3xl leading-snug font-medium text-neutral-900 dark:text-white mb-8">
              {t('about.p1')}
            </p>
            <p className="text-lg sm:text-xl text-neutral-500 leading-relaxed mb-12">
              {t('about.p2')}
            </p>
            <div className="flex flex-wrap gap-8">
              <Link to="/gallery" className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:opacity-50 transition-opacity">
                {t('viewWorks')} <ArrowRight size={16} />
              </Link>
              <button onClick={() => setIsContactOpen(true)} className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white hover:opacity-50 transition-opacity">
                {t('getInTouch')} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          <div className="space-y-16 sm:space-y-24 w-full overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.1, ease }}
            >
              <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-8">{t('software')}</h2>
              
              <div className="relative w-full overflow-hidden flex whitespace-nowrap bg-neutral-100 dark:bg-[#0a0a0a] py-6 border-y border-neutral-200 dark:border-neutral-900">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#fafafa] dark:from-[#030303] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#fafafa] dark:from-[#030303] to-transparent z-10" />
                
                <div className="flex animate-marquee min-w-max">
                  {marqueeItems.map((sw, i) => (
                    <span key={i} className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white mx-6 sm:mx-10 opacity-70 hover:opacity-100 transition-opacity">
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2, ease }}
            >
              <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-8">{expertiseTitle}</h2>
              <ul className="space-y-8">
                {[{ title: t('skills.prop.title'), desc: t('skills.prop.desc') }, { title: t('skills.texturing.title'), desc: t('skills.texturing.desc') }, { title: t('skills.opt.title'), desc: t('skills.opt.desc') }].map((skill, i) => (
                  <li key={i} className="border-b border-neutral-200 dark:border-neutral-800 pb-8 last:border-0 last:pb-0">
                    <h3 className="text-xl font-bold uppercase tracking-wider mb-3 text-neutral-900 dark:text-white">{skill.title}</h3>
                    <p className="text-neutral-500 text-base">{skill.desc}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
          className="py-24 md:py-40"
        >
          <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-16">{t('exp.title')}</h2>
          <div className="flex flex-col border-t border-neutral-200 dark:border-neutral-800">
            {jobs.map((job, i) => (
              <div key={i} className="py-12 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-start gap-6 md:gap-16 group transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900/50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] -z-10" />
                <div className="w-full md:w-1/3 shrink-0 relative z-10 px-4">
                  <p className="text-xs font-mono font-bold text-neutral-400 mb-3">{job.period}</p>
                  <h3 className="text-xl font-bold uppercase tracking-wide text-neutral-900 dark:text-white transition-opacity">{job.company}</h3>
                </div>
                <div className="w-full md:w-2/3 relative z-10 px-4">
                  <h4 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">{job.role}</h4>
                  <p className="text-neutral-500 text-lg leading-relaxed max-w-3xl">{job.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <footer className="pt-12 pb-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-8">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">{t('footer.rights')}</p>
          <div className="flex gap-8">
            <a href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <Instagram size={20} strokeWidth={1.5} />
            </a>
            <a href="https://t.me/kuznecoff_3d" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <Send size={20} strokeWidth={1.5} />
            </a>
            <a href="mailto:hello@glebkuzn.com" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <Mail size={20} strokeWidth={1.5} />
            </a>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {isContactOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#fafafa]/95 dark:bg-[#030303]/95 backdrop-blur-2xl"
            onClick={() => setIsContactOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.6, ease }}
              className="bg-transparent p-8 w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-4xl sm:text-6xl font-bold mb-12 tracking-tighter uppercase text-neutral-900 dark:text-white">{t('contact.title')}</h3>
              <div className="flex flex-col gap-6">
                <a href="mailto:hello@glebkuzn.com" className="flex items-center gap-6 group">
                  <span className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    <Mail size={24} strokeWidth={1.5} />
                  </span>
                  <span className="text-2xl sm:text-4xl font-medium tracking-tight text-neutral-900 dark:text-white group-hover:opacity-60 transition-opacity">hello@glebkuzn.com</span>
                </a>
                <a href="https://t.me/kuznecoff_3d" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group">
                  <span className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    <Send size={24} strokeWidth={1.5} />
                  </span>
                  <span className="text-2xl sm:text-4xl font-medium tracking-tight text-neutral-900 dark:text-white group-hover:opacity-60 transition-opacity">@kuznecoff_3d</span>
                </a>
                <a href="#" className="flex items-center gap-6 group">
                  <span className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                    <Instagram size={24} strokeWidth={1.5} />
                  </span>
                  <span className="text-2xl sm:text-4xl font-medium tracking-tight text-neutral-900 dark:text-white group-hover:opacity-60 transition-opacity">@gleb.kuzn</span>
                </a>
              </div>
              <button 
                onClick={() => setIsContactOpen(false)}
                className="mt-16 text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {t('contact.close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
