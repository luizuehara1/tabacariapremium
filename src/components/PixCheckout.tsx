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
    <div className="flex flex-col items-center p-6 text-center">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white"
      >
        <X />
      </button>

      <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6">
        <QrCode className="text-brand-accent" size={32} />
      </div>

      <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Pagamento Pix</h3>
      <p className="text-white/40 text-sm mb-8">Escaneie o código abaixo para finalizar o pedido de {customerName}</p>

      <div className="p-4 bg-white/5 rounded-3xl border border-white/10 mb-8 w-full">
        <div className="flex justify-between items-center mb-4 px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Valor Total</span>
          <span className="text-xl font-black text-brand-accent">R$ {total.toFixed(2)}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl mb-4 flex items-center justify-center shadow-2xl">
          {qrCodeBase64 ? (
            <img 
              src={`data:image/jpeg;base64,${qrCodeBase64}`} 
              alt="QR Code Pix" 
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center">
              <Loader2 className="animate-spin text-brand-black/20" size={40} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-brand-black p-4 rounded-xl border border-white/5 relative group">
            <div className="text-[8px] text-white/20 uppercase font-black text-left mb-1">Código Copia e Cola</div>
            <div className="text-[10px] text-white/50 break-all font-mono line-clamp-2 text-left">
              {qrCode || "Gerando código..."}
            </div>
            <button 
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-accent text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <button 
            onClick={copyToClipboard}
            className="w-full bg-white text-brand-black py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-accent hover:text-white transition-all shadow-lg shadow-black/20"
          >
            {copied ? (
              <><CheckCircle2 size={14} /> Código Copiado!</>
            ) : (
              <><Copy size={14} /> Copiar Código Pix</>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent animate-pulse">
        <RefreshCw size={12} className="animate-spin-slow" />
        Aguardando Pagamento...
      </div>

      <p className="text-[9px] text-white/20 mt-8 uppercase tracking-widest font-bold max-w-[200px]">
        O status será atualizado automaticamente assim que o pagamento for confirmado.
      </p>
    </div>
  );
}
