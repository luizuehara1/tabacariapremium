import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden bg-brand-black">
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
                HIGH<br/>VAPOR<br/><span className="accent-gradient">STUDIO</span>
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
              
              <div className="relative h-full w-full rounded-[48px] overflow-hidden border border-white/10 glass-card">
                <img 
                  src="https://images.unsplash.com/photo-1620331311520-246422ff82f9?auto=format&fit=crop&q=90&w=1200" 
                  alt="Elite Vaping Experience" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2s] brightness-[0.8] hover:brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent opacity-80" />
                
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="glass-card p-6 rounded-3xl border-white/20 backdrop-blur-3xl animate-float">
                    <div className="flex items-center justify-between mb-4">
                      <div className="px-3 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-accent">
                        Destaque do Mês
                      </div>
                      <div className="flex gap-0.5">
                        <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                        <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                        <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                        <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                        <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                      </div>
                    </div>
                    <div className="text-xl font-bold mb-1">Ignite V50 Premium</div>
                    <div className="text-white/40 text-sm">Experience the ultimate flow</div>
                  </div>
                </div>
              </div>
              
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
