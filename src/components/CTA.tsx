import { motion } from 'motion/react';
import { Send, Instagram } from 'lucide-react';

export default function CTA() {
  const whatsappUrl = "https://wa.me/5541999999999?text=Olá,%20quero%20comprar%20pods";
  const instagramUrl = "https://instagram.com/vapor_.street";

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-accent/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-dark border border-white/10 p-12 lg:p-20 rounded-[48px] text-center relative overflow-hidden shadow-2xl"
        >
          {/* Decorations */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-brand-neon" />
          
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-8">
            Garante o seu <span className="text-gradient">agora</span>
          </h2>
          <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto">
            Não perca tempo. Nosso estoque voa! Clique no botão abaixo e fale diretamente com o nosso time especializado pelo WhatsApp ou nos siga no Instagram.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all scale-100 hover:scale-105 shadow-xl shadow-[#25D366]/20"
            >
              WhatsApp
              <Send size={24} />
            </a>
            <a 
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white px-10 py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3 transition-all scale-100 hover:scale-105 shadow-xl shadow-pink-500/20"
            >
              Instagram
              <Instagram size={24} />
            </a>
          </div>
          <p className="mt-8 text-white/30 text-sm font-medium">Atendimento rápido e personalizado via Direct ou WhatsApp</p>
        </motion.div>
      </div>
    </section>
  );
}
