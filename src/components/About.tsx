import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="sobre" className="py-24 bg-brand-dark/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-accent/20 blur-xl rounded-full" />
              <img 
                src="https://i.postimg.cc/MpvX4Nyx/Chat-GPT-Image-28-de-abr-de-2026-22-38-06.png" 
                alt="Vapor Street Main" 
                referrerPolicy="no-referrer"
                className="rounded-[32px] border border-white/10 shadow-2xl relative z-10 w-full object-cover aspect-square sm:aspect-video lg:aspect-square"
              />
            </motion.div>
          </div>
          
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-brand-neon font-bold uppercase tracking-widest text-sm mb-4 block">Sobre Nós</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                Mais do que uma tabacaria, uma <span className="text-gradient">experiência</span>
              </h2>
              <p className="text-white/60 mb-6 text-lg leading-relaxed">
                Nascemos da paixão por proporcionar momentos de descontração com o que há de mais moderno no mundo do vaping. Nossa curadoria é rigorosa: só oferecemos o que nós mesmos usaríamos.
              </p>
              <p className="text-white/60 mb-10 text-lg leading-relaxed">
                Trabalhamos com marcas líderes que garantem segurança e sabor inigualável. Na Vapor Street, seu estilo é nossa prioridade.
              </p>
              
              <div className="grid grid-cols-2 gap-8 py-8 border-t border-white/5">
                <div>
                  <div className="text-3xl font-extrabold text-brand-accent mb-1">+5k</div>
                  <div className="text-white/40 text-sm uppercase font-bold">Clientes Satisfeitos</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-brand-neon mb-1">100%</div>
                  <div className="text-white/40 text-sm uppercase font-bold">Originalidade</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
