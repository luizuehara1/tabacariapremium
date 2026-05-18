import { motion } from 'motion/react';
import { QrCode, Copy, CheckCircle2, Loader2, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PixCheckoutProps {
  total: number;
  customerName: string;
  qrCode?: string;
  qrCodeBase64?: string;
  orderId?: string;
  onClose: () => void;
}

export default function PixCheckout({ total, customerName, qrCode, qrCodeBase64, orderId, onClose }: PixCheckoutProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 md:p-6 text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white z-30 p-2 bg-black/20 rounded-full backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4 md:mb-6 shrink-0 font-black">
        <QrCode className="text-brand-accent" size={24} />
      </div>

      <h3 className="text-xl md:text-2xl font-black mb-1 md:2 uppercase tracking-tight">Pagamento Pix</h3>
      <p className="text-white/40 text-[10px] md:text-sm mb-6 md:mb-8">Escaneie o código abaixo para finalizar o pedido</p>

      <div className="p-3 md:p-4 bg-white/5 rounded-3xl border border-white/10 mb-6 md:mb-8 w-full max-w-sm">
        <div className="flex justify-between items-center mb-3 md:4 px-2">
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30">Valor Total</span>
          <span className="text-lg md:text-xl font-black text-brand-accent">R$ {total.toFixed(2)}</span>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl mb-4 flex items-center justify-center shadow-2xl overflow-hidden min-h-[160px]">
          {qrCodeBase64 ? (
            <img 
              src={`data:image/png;base64,${qrCodeBase64}`} 
              alt="QR Code Pix" 
              className="w-40 h-40 md:w-48 md:h-48 object-contain"
              onError={(e) => {
                console.error("Erro ao carregar imagem do QR Code");
                (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Erro+QR+Code';
              }}
            />
          ) : (
            <div className="w-40 h-40 md:w-48 md:h-48 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-brand-black/20" size={32} />
              <span className="text-[10px] text-brand-black/40 font-bold uppercase tracking-tight">Gerando código...</span>
            </div>
          )}
        </div>

        <div className="space-y-3 md:4">
          <div className="bg-brand-black p-3 md:4 rounded-xl border border-white/5 relative group">
            <div className="text-[7px] md:text-[8px] text-white/20 uppercase font-black text-left mb-1">Código Copia e Cola</div>
            <div className="text-[9px] md:text-[10px] text-white/50 break-all font-mono line-clamp-2 text-left pr-8">
              {qrCode || "Gerando código..."}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-accent text-white rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <button 
            onClick={copyToClipboard}
            className="w-full bg-white text-brand-black py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-accent hover:text-white active:scale-[0.98] transition-all shadow-lg shadow-black/20"
          >
            {copied ? (
              <><CheckCircle2 size={14} /> Código Copiado!</>
            ) : (
              <><Copy size={14} /> Copiar Código Pix</>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent animate-pulse mb-6 md:8">
        <RefreshCw size={10} className="animate-spin-slow" />
        Aguardando Pagamento...
      </div>

      <p className="text-[8px] md:text-[9px] text-white/20 uppercase tracking-widest font-bold max-w-[200px] pb-4">
        O status será atualizado automaticamente assim que o pagamento for confirmado.
      </p>
    </div>
  );
}
