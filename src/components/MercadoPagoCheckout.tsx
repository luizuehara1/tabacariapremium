import { useState, useEffect } from 'react';
import { CreditCard, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';

interface MercadoPagoCheckoutProps {
  total: number;
  items: any[];
  customerName?: string;
  onClose: () => void;
}

export default function MercadoPagoCheckout({ total, items, customerName, onClose }: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);

  useEffect(() => {
    const createPreference = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items,
            customerName: customerName,
            external_reference: `MP-${Date.now()}`
          })
        });

        if (!response.ok) throw new Error('Falha ao gerar link de pagamento');
        
        const data = await response.json();
        setInitPoint(data.init_point);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createPreference();
  }, [items]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-brand-accent mx-auto mb-4" />
        <p className="text-white/50">Preparando checkout seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-red-400">
        <p>{error}</p>
        <button onClick={onClose} className="mt-4 text-white hover:underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="p-8 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-brand-accent" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Finalizar Pagamento</h3>
        <p className="text-white/50 mb-6">Total a pagar: R$ {total.toFixed(2)}</p>
      </div>

      <div className="space-y-4">
        {initPoint && (
          <a
            href={initPoint}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg"
          >
            Pagar com Mercado Pago
            <ExternalLink size={18} />
          </a>
        )}
        
        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest leading-relaxed">
          Você será redirecionado para o ambiente seguro do Mercado Pago para concluir com cartão ou saldo.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 text-white/50 py-4 rounded-2xl font-bold transition-all mt-4"
        >
          Cancelar e Voltar
        </button>
      </div>
    </div>
  );
}
