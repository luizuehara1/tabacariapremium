import { motion } from 'motion/react';
import { Menu, X, ShoppingBag, Lock } from 'lucide-react';
import { useState } from 'react';
import AdminPanel from './AdminPanel';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-brand-accent group-hover:text-white transition-all duration-500 overflow-hidden relative">
                <ShoppingBag className="w-6 h-6 z-10" />
                <div className="absolute inset-0 bg-brand-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-[-0.04em] uppercase leading-none italic">
                  VAPOR<span className="text-brand-accent">STUDIO</span>
                </span>
                <span className="text-[8px] uppercase tracking-[0.4em] text-white/30 font-bold leading-none mt-1 pl-0.5">Premium Experience</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center space-x-12">
                <nav className="flex items-center space-x-8">
                  {['Início', 'Produtos', 'Diferenciais', 'Sobre'].map((item) => (
                    <a 
                      key={item}
                      href={`#${item.toLowerCase()}`} 
                      className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
                
                <div className="flex items-center gap-4 pl-8 border-l border-white/5">
                  <button 
                    onClick={() => setIsAdminOpen(true)}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    title="Administração"
                  >
                    <Lock size={16} />
                  </button>
                  <a href="#produtos" className="bg-white text-black px-8 py-3.5 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-2xl">
                    Comprar Agora
                  </a>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="p-2 text-white/50"
              >
                <Lock size={20} />
              </button>
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-brand-black border-b border-white/5"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#home" onClick={() => setIsOpen(false)} className="text-white block px-3 py-4 text-base font-medium border-b border-white/5">Início</a>
              <a href="#produtos" onClick={() => setIsOpen(false)} className="text-white block px-3 py-4 text-base font-medium border-b border-white/5">Produtos</a>
              <a href="#diferenciais" onClick={() => setIsOpen(false)} className="text-white block px-3 py-4 text-base font-medium border-b border-white/5">Diferenciais</a>
              <a href="#sobre" onClick={() => setIsOpen(false)} className="text-white block px-3 py-4 text-base font-medium">Sobre</a>
              <div className="p-3">
                <a href="#produtos" onClick={() => setIsOpen(false)} className="block w-full text-center bg-brand-accent text-white px-6 py-3 rounded-xl font-bold">Comprar Agora</a>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </>
  );
}
