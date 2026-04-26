import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  LogOut, 
  User, 
  X, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  LayoutDashboard,
  Loader2,
  Package
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { addProduct, getProducts, deleteProduct, isAdminUser } from '../services/storeService';
import { onAuthStateChanged } from 'firebase/auth';

export default function AdminPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    tag: '',
    description: '',
    flavors: [] as string[]
  });
  const [newFlavor, setNewFlavor] = useState('');

  const addFlavor = () => {
    if (newFlavor.trim() && !formData.flavors.includes(newFlavor.trim())) {
      setFormData({ ...formData, flavors: [...formData.flavors, newFlavor.trim()] });
      setNewFlavor('');
    }
  };

  const removeFlavor = (flavor: string) => {
    setFormData({ ...formData, flavors: formData.flavors.filter(f => f !== flavor) });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && u.email) {
        const adminStatus = await isAdminUser(u.email);
        setIsAdmin(adminStatus);
        if (adminStatus) loadProducts();
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data || []);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addProduct({
        ...formData,
        price: parseFloat(formData.price),
        rating: 5
      });
      setFormData({ name: '', price: '', image: '', tag: '', description: '', flavors: [] });
      loadProducts();
      alert("Produto adicionado com sucesso!");
    } catch (err) {
      alert("Erro ao adicionar produto.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Deseja realmente excluir este produto?")) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert("Erro ao excluir.");
      }
    }
  }

  const [loginError, setLoginError] = useState<string | null>(null);

  async function handleLogin() {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setLoginError(`Domínio não autorizado. Adicione "${domain}" à lista de domínios autorizados no Console do Firebase (Authentication > Settings).`);
      } else {
        setLoginError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
        console.error('Login error:', err);
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-brand-black border-l border-white/10 h-full overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="text-brand-accent w-6 h-6" />
                  <h2 className="text-2xl font-bold">Painel Administrativo</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs leading-relaxed">
                  <p className="font-bold mb-1">Erro de Configuração:</p>
                  {loginError}
                </div>
              )}

              {!user ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="text-white/20 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Acesso Restrito</h3>
                  <p className="text-white/50 mb-8 max-w-sm mx-auto">Faça login com sua conta do Google para acessar a gestão da loja.</p>
                  <button 
                    onClick={handleLogin}
                    className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-3 mx-auto hover:bg-white/90 transition-all active:scale-95"
                  >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
                    Entrar com Google
                  </button>
                </div>
              ) : !isAdmin ? (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-brand-neon mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">Acesso Não Autorizado</h3>
                  <p className="text-white/50 mb-8">Seu usuário não possui permissões de administrador.</p>
                  <div className="p-4 bg-white/5 rounded-2xl mb-8">
                    <div className="text-sm text-white/30 mb-2 font-bold uppercase tracking-widest">Como liberar acesso:</div>
                    <p className="text-[10px] text-white/40 mb-4 leading-relaxed"> No Console do Firebase (tabacaria68), crie uma coleção chamada <code className="text-brand-accent">admins</code> e adicione um documento com o ID abaixo:</p>
                    <div className="text-sm text-white/30 mb-1">Seu E-mail para cadastro:</div>
                    <code className="text-brand-accent text-xs break-all font-mono bg-black/40 p-2 rounded block">{user.email}</code>
                  </div>
                  <button onClick={logout} className="text-white/50 hover:text-white flex items-center gap-2 mx-auto">
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img src={user.photoURL} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border border-white/10" />
                      <div>
                        <div className="text-sm font-bold">{user.displayName}</div>
                        <div className="text-xs text-white/30">Admin</div>
                      </div>
                    </div>
                    <button onClick={logout} className="p-2 hover:bg-white/5 text-white/50 hover:text-red-400 rounded-lg">
                      <LogOut size={20} />
                    </button>
                  </div>

                  {/* Add Product Form */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                       <Plus size={20} className="text-brand-accent" /> Cadastrar Novo Produto
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-xs uppercase font-bold text-white/30 tracking-widest pl-1">Nome do Produto</label>
                        <div className="relative">
                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <input 
                            required
                            placeholder="Ex: Pod Ignite V15"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-brand-dark border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-accent focus:bg-brand-black transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-white/30 tracking-widest pl-1">Preço (R$)</label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <input 
                            required
                            type="number"
                            step="0.01"
                            placeholder="89.90"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-brand-dark border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-accent focus:bg-brand-black outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-white/30 tracking-widest pl-1">Categoria/Tag</label>
                        <div className="relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <input 
                            placeholder="Ex: Mais Vendido"
                            value={formData.tag}
                            onChange={e => setFormData({...formData, tag: e.target.value})}
                            className="w-full bg-brand-dark border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-accent focus:bg-brand-black outline-none"
                          />
                        </div>
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-xs uppercase font-bold text-white/30 tracking-widest pl-1">URL da Imagem</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                          <input 
                            required
                            placeholder="https://exemplo.com/foto-do-pod.jpg"
                            value={formData.image}
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            className="w-full bg-brand-dark border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-brand-accent focus:bg-brand-black outline-none"
                          />
                        </div>
                        {formData.image && (
                          <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                            <img src={formData.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="Preview" />
                          </div>
                        )}
                      </div>

                      <div className="col-span-2 space-y-2">
                        <label className="text-xs uppercase font-bold text-white/30 tracking-widest pl-1">Sabores (Opcional)</label>
                        <div className="flex gap-2">
                          <input 
                            placeholder="Adicionar sabor..."
                            value={newFlavor}
                            onChange={e => setNewFlavor(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFlavor())}
                            className="flex-1 bg-brand-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:border-brand-accent outline-none"
                          />
                          <button 
                            type="button"
                            onClick={addFlavor}
                            className="bg-white/5 hover:bg-white/10 px-4 rounded-xl border border-white/10 text-white transition-all font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.flavors.map(f => (
                            <span key={f} className="bg-brand-accent/20 text-brand-accent px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-brand-accent/30">
                              {f}
                              <button type="button" onClick={() => removeFlavor(f)} className="hover:text-white"><X size={12} /></button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <button 
                        disabled={isAdding}
                        className="col-span-2 bg-brand-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent/80 transition-all shadow-lg shadow-brand-accent/20 disabled:opacity-50"
                      >
                        {isAdding ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Salvar Produto</>}
                      </button>
                    </form>
                  </div>

                  {/* Product List */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold border-t border-white/5 pt-12">Produtos Cadastrados ({products.length})</h3>
                    <div className="grid gap-3">
                      {products.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <img src={p.image} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <div className="font-bold text-sm">{p.name}</div>
                              <div className="text-brand-accent text-xs font-bold">R$ {p.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
