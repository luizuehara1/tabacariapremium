import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronRight, Star } from 'lucide-react';
import { subscribeProducts } from '../services/storeService';

export default function Hero() {
  const [highlightProduct, setHighlightProduct] = useState<any>(null);
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const unsubscribe = subscribeProducts((products) => {
      const highlighted = products.find(p => p.isHighlight);
      if (highlighted) {
        setHighlightProduct(highlighted);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <section id="home" ref={containerRef} className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden bg-brand-black">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2 select-none pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-neon/5 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2 select-none pointer-events-none" />
      <div className="absolute inset-0 noise" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 text-center lg:text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/10 text-brand-accent text-xs font-bold tracking-[0.2em] uppercase mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                </span>
                Qualidade de Elite
              </div>
              
              <h1 className="text-6xl lg:text-[8rem] font-black tracking-[-0.04em] leading-[0.9] mb-10 text-gradient">
                HIGH<br/>VAPOR<br/><span className="accent-gradient">STREET</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/40 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Redefinindo o lifestyle vaping. Curadoria exclusiva de dispositivos premium e sabores que despertam os sentidos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <a href="#produtos" className="btn-primary flex items-center justify-center gap-3">
                  Explorar Catálogo
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#produtos" className="btn-secondary flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                  Ver Promoções
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-x-12 gap-y-6"
            >
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-display">100%</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Originalidade</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-display">24H</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Expedição</span>
              </div>
              <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-display">+500</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Avaliações</span>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative w-full max-w-2xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="relative aspect-[4/5] lg:aspect-square"
            >
              <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-tr from-brand-accent/20 to-brand-neon/20 rounded-[64px] blur-3xl -z-10 animate-pulse-slow" />
              
              <motion.div
                style={{ y, opacity }}
                className="relative h-full w-full rounded-[48px] overflow-hidden border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={highlightProduct?.id || 'static'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={(highlightProduct?.image && highlightProduct.image !== "") ? highlightProduct.image : "https://images.unsplash.com/photo-1620331311520-246422ff82f9?auto=format&fit=crop&q=90&w=1200"} 
                      alt={highlightProduct?.name || "Elite Vaping Experience"} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-110 hover:scale-105 transition-transform duration-[3s] brightness-[0.75] hover:brightness-[0.85]"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent opacity-60" />
                
                {highlightProduct && (
                  <div className="absolute bottom-10 left-10 right-10 z-30">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-brand-black/40 backdrop-blur-xl rounded-[32px] border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-3 bg-brand-accent rounded-full" />
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-accent">
                          Destaque do Mês
                        </div>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-2xl font-black mb-1 drop-shadow-2xl">{highlightProduct.name}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-brand-accent text-brand-accent" />)}
                            </div>
                            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Premium Choice</span>
                          </div>
                        </div>
                        <div className="text-xl font-black text-brand-neon">
                          R$ {highlightProduct.price.toFixed(2)}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Subtle light effect */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-accent/10 to-transparent pointer-events-none" />
              </motion.div>
              
              {/* Abstract decorative rings */}
              <div className="absolute -top-12 -right-12 w-48 h-48 border border-white/5 rounded-full animate-pulse-slow" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 border border-white/5 rounded-full animate-pulse-slow delay-700" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
