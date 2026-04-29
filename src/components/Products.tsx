import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Star, X, Truck, Loader2, Package, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, type FormEvent } from 'react';
import { getProducts, createOrder, subscribeProducts } from '../services/storeService';
import PixCheckout from './PixCheckout';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

function ProductImage({ src, alt, className, imgClassName }: ProductImageProps & { imgClassName?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white/10 animate-spin" />
        </div>
      )}
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName || ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-white/5">
          <Package className="text-white/10" size={32} />
        </div>
      )}
    </div>
  );
}

function ImageCarousel({ images, alt, className, imgClassName }: { images: string[], alt: string, className?: string, imgClassName?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white/10 animate-spin" />
        </div>
      )}
      <AnimatePresence mode="wait">
        {images[currentIndex] ? (
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${imgClassName || ''}`}
          />
        ) : (
          <div key="empty" className="w-full h-full flex items-center justify-center bg-white/5">
            <Package className="text-white/10" size={32} />
          </div>
        )}
      </AnimatePresence>
      
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${
                i === currentIndex ? 'w-4 bg-brand-accent' : 'w-1 bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(['']);
  const [buying, setBuying] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setSelectedFlavors(['']);
    }
  }, [selectedProduct]);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    setQuantity(newQty);
    const newFlavors = [...selectedFlavors];
    if (newQty > selectedFlavors.length) {
      while (newFlavors.length < newQty) newFlavors.push('');
    } else {
      newFlavors.splice(newQty);
    }
    setSelectedFlavors(newFlavors);
  };

  const handleFlavorChange = (index: number, value: string) => {
    const newFlavors = [...selectedFlavors];
    newFlavors[index] = value;
    setSelectedFlavors(newFlavors);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeProducts((data) => {
      setProducts(data || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handlePurchase(e: FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !address) return;

    // Validate flavors if product has them
    if (selectedProduct.flavors?.length > 0 && selectedFlavors.some(f => !f)) {
      alert("Por favor, selecione um sabor para cada item.");
      return;
    }

    setBuying(true);
    try {
      await createOrder({
        customerName: "Cliente Visita",
        address: address,
        items: [{ 
          id: selectedProduct.id, 
          name: typeof selectedProduct.name === 'string' ? selectedProduct.name : "Produto", 
          price: selectedProduct.price,
          quantity: quantity,
          flavors: selectedFlavors
        }],
        total: (selectedProduct.price * quantity) + 10
      });
      setShowPix(true);
    } catch (err) {
      alert("Erro ao processar pedido. Verifique os dados.");
    } finally {
      setBuying(false);
    }
  }

  const closeModals = () => {
    setSelectedProduct(null);
    setShowPix(false);
    setPurchaseSuccess(false);
    setAddress('');
  };

  return (
    <section id="produtos" className="py-32 bg-brand-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-brand-accent/5 rounded-full blur-[160px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 text-brand-accent font-bold tracking-[0.2em] uppercase text-xs mb-4">
                <span className="w-8 h-[1px] bg-brand-accent" />
                Catálogo Exclusivo
              </div>
              <h2 className="text-5xl lg:text-7xl font-black tracking-tight mb-6">
                ELITE <span className="text-gradient">SELECTION</span>
              </h2>
              <p className="text-white/40 text-lg lg:text-xl font-light leading-relaxed">
                Produtos selecionados individualmente para garantir a melhor experiência de vaporização. Frete fixo R$ 10,00.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <div className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-brand-accent/10 rounded-xl text-brand-accent">
                <Truck size={24} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-white/30 font-bold">Frete Único</div>
                <div className="font-bold">R$ 10,00</div>
              </div>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="animate-spin text-brand-accent w-12 h-12" />
            <span className="text-white/20 tracking-widest uppercase font-bold text-xs">Sincronizando Inventário...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length === 0 && (
              <div className="col-span-full text-center py-32 glass-card rounded-[48px] border-dashed border-white/10">
                <Package size={48} className="mx-auto mb-6 text-white/10" />
                <div className="text-white/30 font-medium text-lg tracking-tight">O estoque está sendo atualizado.<br/>Volte em alguns instantes.</div>
              </div>
            )}
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="glass-card rounded-[32px] overflow-hidden transition-all duration-500 group-hover:bg-brand-card/60 group-hover:translate-y-[-8px] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <ImageCarousel 
                      images={product.images?.length > 0 ? product.images : [product.image]} 
                      alt={product.name} 
                      className="w-full h-full"
                      imgClassName="group-hover:scale-110 brightness-[0.8] group-hover:brightness-100 transition-transform duration-[1.5s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {product.tag && (
                      <div className="absolute top-6 left-6">
                        <span className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xl">
                          {product.tag}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-6 left-6 right-6 translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent hover:text-white transition-colors"
                      >
                        <ShoppingCart size={18} />
                        Comprar Agora
                      </button>
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            className={i < (product.rating || 5) ? "text-brand-accent fill-brand-accent" : "text-white/10"} 
                          />
                        ))}
                        <span className="ml-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">(4.9)</span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-6 group-hover:text-white transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-xs text-white/30 font-bold uppercase">R$</span>
                      <span className="text-3xl font-black tracking-tight">{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModals}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative bg-brand-dark border border-white/10 w-full ${showPix ? 'max-w-md' : 'max-w-lg'} rounded-[32px] overflow-hidden shadow-2xl flex flex-col`}
            >
              <div className={showPix ? "" : "p-8"}>
                {!showPix && (
                  <button 
                    onClick={closeModals}
                    className="absolute top-6 right-6 text-white/50 hover:text-white z-20"
                  >
                    <X />
                  </button>
                )}

                {showPix ? (
                  <PixCheckout 
                    total={(selectedProduct.price * quantity) + 10}
                    customerName="Cliente Visita"
                    onClose={closeModals}
                  />
                ) : purchaseSuccess ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="text-white w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pedido Realizado!</h3>
                    <p className="text-white/50">Seu pedido foi registrado. Entraremos em contato.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-6">Finalizar Compra</h3>
                    <div className="flex gap-4 mb-8 p-4 bg-white/5 rounded-2xl">
                      <ImageCarousel 
                        images={selectedProduct.images?.length > 0 ? selectedProduct.images : [selectedProduct.image]} 
                        alt={selectedProduct.name} 
                        className="w-20 h-20 rounded-xl" 
                      />
                      <div>
                        <div className="font-bold">{selectedProduct.name}</div>
                        <div className="text-brand-accent font-extrabold text-lg">R$ {selectedProduct.price.toFixed(2)}</div>
                      </div>
                    </div>

                    <form onSubmit={handlePurchase} className="space-y-6">
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-sm font-bold text-white/50 tracking-widest uppercase">Quantidade</span>
                        <div className="flex items-center gap-4">
                          <button 
                            type="button" 
                            onClick={() => handleQuantityChange(quantity - 1)}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold w-4 text-center">{quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center hover:bg-brand-accent/80 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {selectedProduct.flavors?.length > 0 && (
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-black text-brand-accent tracking-[0.2em] pl-1">Seleção de Sabores</label>
                          {selectedFlavors.map((flavor, index) => (
                            <div key={index} className="space-y-1">
                              <span className="text-[10px] text-white/30 uppercase font-bold pl-1">Item {index + 1}</span>
                              <select
                                required
                                value={flavor}
                                onChange={(e) => handleFlavorChange(index, e.target.value)}
                                className="w-full bg-brand-black border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-brand-accent outline-none appearance-none cursor-pointer"
                              >
                                <option value="" disabled>Escolha o sabor...</option>
                                {selectedProduct.flavors.map((f: string) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/50 mb-2">Endereço de Entrega</label>
                        <textarea 
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Rua, Número, Bairro, Cidade, CEP"
                          className="w-full bg-brand-black border border-white/10 rounded-2xl p-4 text-white focus:border-brand-accent outline-none min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="p-4 bg-brand-black/50 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal ({quantity}x)</span>
                          <span>R$ {(selectedProduct.price * quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><Truck size={14} /> Frete Fixo</span>
                          <span>R$ 10,00</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-brand-accent text-2xl">R$ {((selectedProduct.price * quantity) + 10).toFixed(2)}</span>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={buying}
                        className="w-full bg-brand-accent hover:bg-brand-accent/90 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-accent/20 disabled:opacity-50"
                      >
                        {buying ? <Loader2 className="animate-spin" /> : "Confirmar Pedido"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
