/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import Differentials from './components/Differentials';
import About from './components/About';
import CTA from './components/CTA';
import WhatsAppButton from './components/WhatsAppButton';
import { useEffect } from 'react';
import { testConnection } from './lib/firebase';

export default function App() {
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Differentials />
        <Products />
        <About />
        <CTA />
      </main>
      
      <footer className="py-12 border-t border-white/5 text-center text-white/30 text-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <img 
            src="https://i.postimg.cc/MpvX4Nyx/Chat-GPT-Image-28-de-abr-de-2026-22-38-06.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-xl object-cover border border-white/10"
          />
          <span className="text-white font-bold tracking-tighter uppercase">Vapor<span className="text-brand-accent">Street</span></span>
        </div>
        <p>&copy; {new Date().getFullYear()} Vapor Street. Todos os direitos reservados.</p>
        <p className="mt-2">O consumo de nicotina pode causar dependência. Venda proibida para menores de 18 anos.</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
