import { CheckCircle2, ShieldCheck, Zap, Truck } from 'lucide-react';
import { motion } from 'motion/react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Produtos Originais',
    description: 'Trabalhamos apenas com as melhores marcas globais e itens autenticados.'
  },
  {
    icon: Zap,
    title: 'Entrega Instantânea',
    description: 'Enviamos seu pedido em tempo recorde para garantir que nunca falte estilo.'
  },
  {
    icon: Truck,
    title: 'Frete Seguro',
    description: 'Embalagens discretas e transporte monitorado até a sua porta.'
  },
  {
    icon: CheckCircle2,
    title: 'Qualidade Premium',
    description: 'Curadoria especializada para selecionar os melhores aparelhos e essências.'
  }
];

export default function Differentials() {
  return (
    <section id="diferenciais" className="py-32 relative bg-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-brand-black p-12 hover:bg-brand-card/50 transition-colors group"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-accent group-hover:text-white transition-all duration-500">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-4 tracking-tight uppercase tracking-widest">{feature.title}</h3>
              <p className="text-white/30 text-sm leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
