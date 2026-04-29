import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PixCheckoutProps {
  total: number;
  customerName: string;
  orderId?: string;
  onClose: () => void;
}

export default function PixCheckout({ total, customerName, onClose }: PixCheckoutProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const PIX_KEY = "SUA_CHAVE_PIX_AQUI"; // In a real app, this would be an env var
  
  // Simulated loading for QR code generation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const pixPayload = `00020101021226820014br.gov.bcb.pix0120${PIX_KEY}520400005303986540${total.toFixed(2)}5802BR5912Vapor Street6009Sao Paulo62070503***6304`;
  // Note: This is a simplified PIX payload for display purposes. 
  // In a real production environment, you'd use a dedicated library or API to generate a valid static/dynamic EMV PIX payload.
  // For this frontend-only demo, we'll use a string that looks like a PIX payload.
  const displayPayload = `Pagamento PIX R$ ${total.toFixed(2)} - Chave: ${PIX_KEY}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const message = `Olá, acabei de realizar o pagamento via PIX no valor de R$ ${total.toFixed(2)}, segue o comprovante.`;
    const url = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 bg-brand-dark rounded-[32px] w-full max-w-md mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">PAGAMENTO <span className="text-brand-accent">PIX</span></h2>
          <p className="text-white/40 text-sm">Escaneie o código abaixo para finalizar</p>
        </div>

        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 mb-8 w-full flex flex-col items-center">
          <div className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">Valor Total</div>
          <div className="text-4xl font-black text-white">
            <span className="text-brand-accent text-lg align-top mr-1">R$</span>
            {total.toFixed(2)}
          </div>
        </div>

        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-brand-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-brand-accent/10">
            {loading ? (
              <div className="w-48 h-48 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
              </div>
            ) : (
              <QRCodeSVG 
                value={displayPayload} 
                size={192}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/favicon.ico",
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            )}
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="bg-brand-black/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] text-white/30 uppercase font-bold mb-1">Código Copia e Cola</p>
              <p className="text-xs text-white/60 truncate font-mono">{displayPayload}</p>
            </div>
            <button 
              onClick={copyToClipboard}
              className="p-3 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent rounded-xl transition-all relative group"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <CheckCircle2 size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Copy size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-brand-accent text-white text-[10px] rounded font-bold transition-all ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                COPIADO
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <button 
              onClick={shareToWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98]"
            >
              <MessageCircle size={24} />
              JÁ PAGUEI
            </button>
            <button 
              onClick={onClose}
              className="w-full text-white/30 hover:text-white/60 font-bold py-3 text-sm transition-colors"
            >
              Cancelar e voltar
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-white/20 text-[9px] uppercase tracking-widest font-black">
          <AlertCircle size={12} />
          Pagamento processado via PIX instantâneo
        </div>
      </div>
    </div>
  );
}
