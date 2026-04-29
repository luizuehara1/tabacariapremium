import { useState, useEffect } from 'react';
import { CreditCard, Loader2, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface MercadoPagoCheckoutProps {
  total: number;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  onClose: () => void;
}

export default function MercadoPagoCheckout({ total, items, onClose }: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);

  useEffect(() => {
    async function createCheckout() {
      try {
        const response = await fetch('/api/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            external_reference: `order_${Date.now()}`
          }),
        });

        if (!response.ok) throw new Error('Falha ao gerar link de pagamento');

        const data = await response.json();
        setPreferenceId(data.id);
        setInitPoint(data.init_point);
        setLoading(false);
      } catch (err) {
        console.error('Checkout error:', err);
        setError('Não foi possível gerar o link de pagamento. Tente novamente.');
        setLoading(false);
      }
    }

    createCheckout();
  }, [items]);

  const handlePay = () => {
    if (initPoint) {
      window.location.href = initPoint;
    }
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 bg-brand-dark rounded-[32px] w-full max-w-md mx-auto relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2 uppercase italic text-white">
            PAGAMENTO <span className="text-brand-accent">SEGURADO</span>
          </h2>
          <p className="text-white/40 text-sm font-medium">Via Mercado Pago &copy;</p>
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8 w-full flex flex-col items-center">
          <div className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-2 opacity-60">Total a Pagar</div>
          <div className="text-4xl font-black text-white">
            <span className="text-brand-accent text-lg align-top mr-1">R$</span>
            {total.toFixed(2)}
          </div>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-4 mb-8">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <p className="text-red-500 text-xs font-bold leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Garantia de Compra</p>
                  <p className="text-[11px] text-white/70 font-medium">Sua transação é protegida e criptografada.</p>
                </div>
              </div>

              <button 
                onClick={handlePay}
                disabled={loading}
                className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-black py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-brand-accent/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    PREPARANDO...
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    PAGAR COM MERCADO PAGO
                  </>
                )}
              </button>
            </div>

            <button 
              onClick={onClose}
              disabled={loading}
              className="w-full text-white/30 hover:text-white/60 font-black py-2 text-[10px] uppercase tracking-[0.2em] transition-colors"
            >
              Cancelar e voltar
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3 text-white/20 text-[9px] uppercase tracking-[0.3em] font-black">
          <div className="w-8 h-[1px] bg-white/10" />
          Powered by Mercado Pago
          <div className="w-8 h-[1px] bg-white/10" />
        </div>
      </div>
    </div>
  );
}
